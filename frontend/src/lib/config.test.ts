import { describe, expect, it } from "vitest";

import { isFallbackCatalogEnabled, resolveApiBaseUrl } from "@/lib/config";

describe("resolveApiBaseUrl", () => {
  it("uses an explicit configured API base URL when provided", () => {
    expect(
      resolveApiBaseUrl({
        DEV: false,
        VITE_API_BASE_URL: "https://api.nevkcosmetics.com/api/",
      }),
    ).toBe("https://api.nevkcosmetics.com/api");
  });

  it("falls back to the local Django API during development", () => {
    expect(resolveApiBaseUrl({ DEV: true })).toBe("http://127.0.0.1:8000/api");
  });

  it("falls back to a same-origin API path in production", () => {
    expect(resolveApiBaseUrl({ DEV: false })).toBe("/api");
  });
});

describe("isFallbackCatalogEnabled", () => {
  it("treats only the string true as enabled", () => {
    expect(isFallbackCatalogEnabled({ VITE_USE_FALLBACK_CATALOG: "true" })).toBe(
      true,
    );
    expect(
      isFallbackCatalogEnabled({ VITE_USE_FALLBACK_CATALOG: "false" }),
    ).toBe(false);
    expect(isFallbackCatalogEnabled({})).toBe(false);
  });
});
