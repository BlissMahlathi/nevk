type FrontendEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
  VITE_SUPABASE_PRODUCTS_BUCKET?: string;
  VITE_WHATSAPP_ORDER_NUMBER?: string;
  VITE_USE_FALLBACK_CATALOG?: string;
};

export function requireEnvValue(value: string | undefined, name: string) {
  const resolved = value?.trim();
  if (!resolved) {
    throw new Error(
      `Missing ${name}. Add it to your frontend environment configuration.`,
    );
  }
  return resolved;
}

export function isFallbackCatalogEnabled(env: FrontendEnv) {
  return env.VITE_USE_FALLBACK_CATALOG === "true";
}

export function normalizeWhatsAppNumber(value: string | undefined) {
  return (value || "").replace(/\D/g, "");
}

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
  "";
export const SUPABASE_PRODUCTS_BUCKET =
  import.meta.env.VITE_SUPABASE_PRODUCTS_BUCKET?.trim() || "products";
export const WHATSAPP_ORDER_NUMBER =
  normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_ORDER_NUMBER) ||
  "27715231720";
export const USE_FALLBACK_CATALOG = isFallbackCatalogEnabled(import.meta.env);
