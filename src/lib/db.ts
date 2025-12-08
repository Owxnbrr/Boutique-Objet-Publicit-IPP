import { createClient } from '@supabase/supabase-js';

export function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
