/** Server-only Supabase admin client */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabase } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const { url, serviceRoleKey } = requireSupabase();
  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
