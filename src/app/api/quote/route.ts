import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  product_id: z.string().uuid(),
  variant_sku: z.string().optional(),
  quantity: z.number().int().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = schema.parse(payload);

    const db = admin(); // utilise SUPABASE_SERVICE_ROLE_KEY (serveur)
    const { error } = await db.from("quotes").insert(data);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "quote_create_failed" },
      { status: 400 }
    );
  }
}
