/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PRODUCTS_BUCKET?: string;
  readonly VITE_WHATSAPP_ORDER_NUMBER?: string;
  readonly VITE_USE_FALLBACK_CATALOG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
