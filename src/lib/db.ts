import { createClient } from '@supabase/supabase-js';

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server only
  return createClient(url, key);
}
