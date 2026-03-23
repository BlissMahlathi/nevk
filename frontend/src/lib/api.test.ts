import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createWhatsAppOrder,
  fetchProductDetail,
  fetchProducts,
} from "@/lib/api";

const fromMock = vi.fn();
const storageFromMock = vi.fn(() => ({
  getPublicUrl: vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.example.com/${path}` },
  })),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => ({
    from: fromMock,
    storage: {
      from: storageFromMock,
    },
  }),
}));

describe("catalog api client", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_WHATSAPP_ORDER_NUMBER", "27715231720");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fromMock.mockReset();
    storageFromMock.mockClear();
  });

  it("filters featured products from supabase results", async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: "Rose Shine",
            slug: "rose-shine",
            description: "Hydrating gloss",
            price: "120.00",
            stock: 4,
            is_featured: true,
            is_active: true,
            category: { name: "Lip Gloss", slug: "lip-gloss" },
            images: [
              {
                processed_image: "https://cdn.example.com/rose-shine.webp",
                original_image: null,
                is_primary: true,
              },
            ],
          },
          {
            id: 2,
            name: "Daily Balm",
            slug: "daily-balm",
            description: "Everyday balm",
            price: "99.00",
            stock: 10,
            is_featured: false,
            is_active: true,
            category: { name: "Lip Care", slug: "lip-care" },
            images: [],
          },
        ],
        error: null,
      }),
    };
    fromMock.mockReturnValue(query);

    const products = await fetchProducts({ featured: true });

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: "1",
      slug: "rose-shine",
      price: 120,
      image: "https://cdn.example.com/rose-shine.webp",
      isFeatured: true,
    });
  });

  it("maps product detail payloads into the storefront shape", async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 2,
          name: "Glow Butter",
          slug: "glow-butter",
          description: "A rich body butter.",
          price: "180.00",
          stock: 7,
          is_featured: false,
          is_active: true,
          category: {
            name: "Body Care",
            slug: "body-care",
          },
          images: [
            {
              processed_image: "https://cdn.example.com/glow-butter.webp",
              original_image: "https://cdn.example.com/glow-butter.png",
              is_primary: true,
            },
          ],
        },
        error: null,
      }),
    };
    fromMock.mockReturnValue(query);

    const product = await fetchProductDetail("glow-butter");

    expect(product).toMatchObject({
      id: "2",
      slug: "glow-butter",
      category: "Body Care",
      categorySlug: "body-care",
      price: 180,
      image: "https://cdn.example.com/glow-butter.webp",
    });
  });

  it("builds a WhatsApp checkout URL on the client", async () => {
    const result = await createWhatsAppOrder({
      items: [
        { name: "Rose Shine", quantity: 2, price: 120 },
        { name: "Coffee Scrub", quantity: 1, price: 50 },
      ],
    });

    expect(result.whatsapp_url).toContain("https://wa.me/27715231720?text=");
    expect(result).toMatchObject({
      subtotal: 290,
      item_count: 3,
    });
    expect(result.order_id.startsWith("local-")).toBe(true);
  });
});
