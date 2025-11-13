/**
 * Script cron : télécharge le XML ANDA et upsert dans Supabase
 * Usage : npm run import:xml
 *
 * .env
 *   ANDA_XML_URL=./public/catalog-sample.xml
 *   (ou) ANDA_XML_URL=http://127.0.0.1:3000/catalog-sample.xml
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { admin } from '@/lib/db';

const arr = <T>(x: T | T[] | undefined | null): T[] =>
  x == null ? [] : Array.isArray(x) ? x : [x];

async function run() {
  const raw = process.env.ANDA_XML_URL?.trim();
  const source = raw && raw.length > 0 ? raw : 'public/catalog-sample.xml';

  let xml: string;
  if (/^https?:\/\//i.test(source)) {
    console.log('> Lecture via HTTP :', source);
    const { data } = await axios.get(source, { timeout: 60_000 });
    xml = typeof data === 'string' ? data : String(data);
  } else {
    const resolved = path.isAbsolute(source)
      ? source
      : path.resolve(process.cwd(), source);
    console.log('> Lecture fichier local :', resolved);
    xml = await fs.readFile(resolved, 'utf8');
  }

  const json = await parseStringPromise(xml, { explicitArray: false });

  const items = json?.catalog?.product ?? [];
  const list = Array.isArray(items) ? items : [items];

  const db = admin();
  let ok = 0, ko = 0;

  for (const p of list) {
    try {
      const idAnda   = p?.$?.id ?? p?.id;
      const name     = p?.name?._ ?? p?.name ?? '';
      const category = p?.category ?? null;
      const brand    = p?.brand ?? null;
      const minQty   = Number(p?.min_qty ?? 1);
      const leadTime = Number(p?.lead_time?.$?.days ?? p?.lead_time ?? 0);

      const imagesRaw = arr(p?.images?.image);
      const thumbnail = imagesRaw[0] ?? null;

      const basePrice = Number(p?.price?._ ?? p?.price ?? 0) || 0;
      const currency  = p?.price?.$?.currency ?? 'EUR';

      if (!idAnda || !name) {
        console.warn('skip produit invalide :', { idAnda, name });
        ko++;
        continue;
      }

      const { data: prod, error: pe } = await db
        .from('products')
        .upsert(
          {
            id_anda: idAnda,
            name,
            category,
            brand,
            min_qty: minQty,
            lead_time_days: leadTime,
            thumbnail_url: thumbnail,
            base_price: basePrice,            
          },
          { onConflict: 'id_anda' }
        )
        .select('id')
        .single();

      if (pe || !prod?.id) {
        console.error('product upsert', pe);
        ko++;
        continue;
      }

      const productId = prod.id;

      if (imagesRaw.length > 0) {
        await db.from('assets').delete().eq('product_id', productId);
        const rows = imagesRaw.map((url: string) => ({
          product_id: productId,
          url,
          type: 'image' as const,
        }));
        const { error: ae } = await db.from('assets').insert(rows);
        if (ae) console.error('assets insert', ae);
      }

      const variantsRaw = arr(p?.variants?.variant);
      if (variantsRaw.length > 0) {
        for (const v of variantsRaw) {
          const sku   = v?.$?.sku   ?? v?.sku;
          const color = v?.$?.color ?? v?.color ?? null;
          const size  = v?.$?.size  ?? v?.size  ?? null;
          if (!sku) continue;

          const { error: ve } = await db
            .from('variants')
            .upsert({ sku, product_id: productId, color, size });
          if (ve) console.error('variant upsert', ve);
        }
      }

      const firstSku = variantsRaw[0]?.$?.sku ?? variantsRaw[0]?.sku;
      if (firstSku && basePrice > 0) {
        const { error: prErr } = await db
          .from('prices')
          .upsert({ variant_sku: firstSku, currency, qty_break: 1, unit_price: basePrice });
        if (prErr) console.error('price upsert', prErr);
      }

      ok++;
    } catch (e) {
      console.error('import produit KO', e);
      ko++;
    }
  }

  console.log(`Import terminé. OK=${ok}  KO=${ko}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
