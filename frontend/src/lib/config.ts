const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000/api";
const DEFAULT_PROD_API_BASE_URL = "/api";

type FrontendEnv = {
  DEV?: boolean;
  VITE_API_BASE_URL?: string;
  VITE_USE_FALLBACK_CATALOG?: string;
};

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

export function resolveApiBaseUrl(env: FrontendEnv) {
  if (env.VITE_API_BASE_URL?.trim()) {
    return normalizeBaseUrl(env.VITE_API_BASE_URL);
  }

  return env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL;
}

export function isFallbackCatalogEnabled(env: FrontendEnv) {
  return env.VITE_USE_FALLBACK_CATALOG === "true";
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env);
export const USE_FALLBACK_CATALOG = isFallbackCatalogEnabled(import.meta.env);
