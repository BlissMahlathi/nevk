/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_FALLBACK_CATALOG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
