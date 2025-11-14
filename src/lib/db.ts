import { createClient } from '@supabase/supabase-js';

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // côté serveur

  if (!url) throw new Error("❌ NEXT_PUBLIC_SUPABASE_URL manquant");
  if (!key) throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY manquant");

  return createClient(url, key);
}
