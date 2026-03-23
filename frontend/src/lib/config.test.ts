import { describe, expect, it } from "vitest";

import {
  isFallbackCatalogEnabled,
  normalizeWhatsAppNumber,
  requireEnvValue,
} from "@/lib/config";

describe("requireEnvValue", () => {
  it("returns a trimmed value when provided", () => {
    expect(requireEnvValue("  value  ", "VITE_X")).toBe("value");
  });

  it("throws for missing values", () => {
    expect(() => requireEnvValue("", "VITE_X")).toThrow("Missing VITE_X");
  });
});

describe("normalizeWhatsAppNumber", () => {
  it("keeps only digits", () => {
    expect(normalizeWhatsAppNumber("+27 71 523 1720")).toBe("27715231720");
  });
});

describe("isFallbackCatalogEnabled", () => {
  it("treats only the string true as enabled", () => {
    expect(
      isFallbackCatalogEnabled({ VITE_USE_FALLBACK_CATALOG: "true" }),
    ).toBe(true);
    expect(
      isFallbackCatalogEnabled({ VITE_USE_FALLBACK_CATALOG: "false" }),
    ).toBe(false);
    expect(isFallbackCatalogEnabled({})).toBe(false);
  });
});
