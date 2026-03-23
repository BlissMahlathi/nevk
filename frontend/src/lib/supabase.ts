import { createClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, requireEnvValue } from "@/lib/config";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = requireEnvValue(SUPABASE_URL, "VITE_SUPABASE_URL");
  const anonKey = requireEnvValue(SUPABASE_ANON_KEY, "VITE_SUPABASE_ANON_KEY");

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseClient;
}
