import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createWhatsAppOrder,
  fetchProductDetail,
  fetchProducts,
} from "@/lib/api";

type MockResponseBody = Record<string, unknown> | Array<unknown>;

function createMockResponse(body: MockResponseBody, ok = true) {
  return {
    ok,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("catalog api client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("uses the featured products endpoint when no other filters are present", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse([
        {
          id: 1,
          name: "Rose Shine",
          slug: "rose-shine",
          price: "120.00",
          stock: 4,
          in_stock: true,
          is_featured: true,
          category_name: "Lip Gloss",
          category_slug: "lip-gloss",
          primary_image: "https://cdn.example.com/rose-shine.webp",
        },
      ]),
    );

    const products = await fetchProducts({ featured: true });

    expect(fetchMock.mock.calls[0][0]).toContain("/catalog/products/featured/");
    expect(products[0]).toMatchObject({
      id: "1",
      slug: "rose-shine",
      price: 120,
      image: "https://cdn.example.com/rose-shine.webp",
      isFeatured: true,
    });
  });

  it("maps product detail payloads into the storefront shape", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        id: 2,
        name: "Glow Butter",
        slug: "glow-butter",
        description: "A rich body butter.",
        price: "180.00",
        stock: 7,
        in_stock: true,
        is_featured: false,
        is_active: true,
        category: {
          id: 9,
          name: "Body Care",
          slug: "body-care",
          description: "",
          is_active: true,
        },
        images: [
          {
            id: 10,
            display_image: "https://cdn.example.com/glow-butter.webp",
            processed_image: "https://cdn.example.com/glow-butter.webp",
            original_image: "https://cdn.example.com/glow-butter.png",
            alt_text: "Glow Butter",
            is_primary: true,
          },
        ],
      }),
    );

    const product = await fetchProductDetail("glow-butter");

    expect(fetchMock.mock.calls[0][0]).toContain("/catalog/products/glow-butter/");
    expect(product).toMatchObject({
      id: "2",
      slug: "glow-butter",
      category: "Body Care",
      categorySlug: "body-care",
      price: 180,
      image: "https://cdn.example.com/glow-butter.webp",
    });
  });

  it("posts WhatsApp checkout payloads to the backend", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        order_id: 14,
        whatsapp_url: "https://wa.me/27715231720?text=Hello",
        subtotal: 290,
        item_count: 3,
      }),
    );

    const result = await createWhatsAppOrder({
      items: [
        { name: "Rose Shine", quantity: 2, price: 120 },
        { name: "Coffee Scrub", quantity: 1, price: 50 },
      ],
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/orders/whatsapp/");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
    });
    expect(result).toMatchObject({
      order_id: 14,
      subtotal: 290,
      item_count: 3,
    });
  });
});
