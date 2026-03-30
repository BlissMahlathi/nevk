import type { Category, Product } from "@/data/products";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
} from "@/data/products";
import { SUPABASE_PRODUCTS_BUCKET, WHATSAPP_ORDER_NUMBER } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase";

interface SupabaseCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

interface SupabaseProductImage {
  original_image?: string | null;
  processed_image?: string | null;
  is_primary?: boolean | null;
}

interface SupabaseProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  stock: number;
  flavor?: string | null;
  color?: string | null;
  scent?: string | null;
  size?: string | null;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    name: string;
    slug: string;
  } | null;
  images?: SupabaseProductImage[] | null;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface WhatsAppOrderPayload {
  customer_name?: string;
  customer_phone?: string;
  note?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface WhatsAppOrderResponse {
  order_id: string;
  whatsapp_url: string;
  subtotal: number;
  item_count: number;
}

const fallbackProductBySlug = new Map(
  fallbackProducts.map((product) => [product.slug, product]),
);
const fallbackCategoryBySlug = new Map(
  fallbackCategories.map((category) => [category.slug, category]),
);

function pickProductImage(data: {
  slug: string;
  categorySlug?: string;
  primaryImage?: string | null;
  images?: string[];
}) {
  if (data.primaryImage) {
    return data.primaryImage;
  }

  if (data.images && data.images.length > 0) {
    return data.images[0];
  }

  const fallbackProduct = fallbackProductBySlug.get(data.slug);
  if (fallbackProduct?.image) {
    return fallbackProduct.image;
  }

  const fallbackCategory = data.categorySlug
    ? fallbackCategoryBySlug.get(data.categorySlug)
    : undefined;
  return fallbackCategory?.image || fallbackProducts[0]?.image || "";
}

function resolveSupabaseImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/^\//, "");
  const bucketPrefix = `${SUPABASE_PRODUCTS_BUCKET}/`;
  // Export/import datasets may store object paths with the bucket name included.
  // Supabase storage APIs expect the path relative to the selected bucket.
  const objectPath = normalizedPath.startsWith(bucketPrefix)
    ? normalizedPath.slice(bucketPrefix.length)
    : normalizedPath;
  const { data } = getSupabaseClient()
    .storage.from(SUPABASE_PRODUCTS_BUCKET)
    .getPublicUrl(objectPath);
  return data.publicUrl || trimmed;
}

function mapSupabaseCategory(category: SupabaseCategory): Category {
  const fallbackCategory = fallbackCategoryBySlug.get(category.slug);

  return {
    name: category.name,
    slug: category.slug,
    description: category.description || fallbackCategory?.description || "",
    isActive: category.is_active,
    image: fallbackCategory?.image,
  };
}

function mapSupabaseProduct(item: SupabaseProduct): Product {
  const fallbackProduct = fallbackProductBySlug.get(item.slug);
  const sortedImages = [...(item.images || [])].sort((a, b) => {
    if (a.is_primary === b.is_primary) {
      return 0;
    }
    return a.is_primary ? -1 : 1;
  });
  const imageUrls = sortedImages
    .map((imageItem) =>
      resolveSupabaseImageUrl(
        imageItem.processed_image || imageItem.original_image || null,
      ),
    )
    .filter((image): image is string => Boolean(image));
  const image = pickProductImage({
    slug: item.slug,
    categorySlug: item.category?.slug,
    primaryImage: imageUrls[0] || null,
    images: imageUrls,
  });

  return {
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    description: item.description || fallbackProduct?.description || "",
    price: Number(item.price),
    category:
      item.category?.name || fallbackProduct?.category || "Uncategorized",
    categorySlug: item.category?.slug || fallbackProduct?.categorySlug || "",
    image,
    images: imageUrls.length > 0 ? imageUrls : image ? [image] : [],
    flavor: item.flavor || fallbackProduct?.flavor,
    color: item.color || fallbackProduct?.color,
    scent: item.scent || fallbackProduct?.scent,
    size: item.size || fallbackProduct?.size,
    isFeatured: item.is_featured,
    isActive: item.is_active,
    stock: item.stock,
  };
}

function buildOrderWhatsappUrl(
  payload: WhatsAppOrderPayload,
  subtotal: number,
) {
  const lines = payload.items.map(
    (item, index) =>
      `${index + 1}. ${item.name} x${item.quantity} - R ${(item.quantity * item.price).toFixed(2)}`,
  );

  const messageParts = [
    "Hello Nevk Cosmetics, I would like to place this order:",
    "",
    ...lines,
    "",
  ];

  if (payload.customer_name?.trim()) {
    messageParts.push(`Name: ${payload.customer_name.trim()}`);
  }

  if (payload.customer_phone?.trim()) {
    messageParts.push(`Phone: ${payload.customer_phone.trim()}`);
  }

  messageParts.push(`Subtotal: R ${subtotal.toFixed(2)}`);
  messageParts.push(
    `Items: ${payload.items.reduce((sum, item) => sum + item.quantity, 0)}`,
  );

  if (payload.note?.trim()) {
    messageParts.push("");
    messageParts.push(`Note: ${payload.note.trim()}`);
  }

  messageParts.push("");
  messageParts.push("Please confirm availability and delivery details.");

  return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(messageParts.join("\n"))}`;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .select("id, name, slug, description, is_active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || [])
    .map(mapSupabaseCategory)
    .filter((category) => category.isActive);
}

export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<Product[]> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(
      "id, name, slug, description, price, stock, flavor, color, scent, size, is_featured, is_active, category:categories(name, slug), images:product_images(original_image, processed_image, is_primary)",
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const categoryFilter = params.category?.trim().toLowerCase();
  const searchFilter = params.search?.trim().toLowerCase();

  const filtered = (data || [])
    .filter((item) => {
      if (!params.featured) {
        return true;
      }
      return item.is_featured;
    })
    .filter((item) => {
      if (!categoryFilter || categoryFilter === "all") {
        return true;
      }
      return item.category?.slug?.toLowerCase() === categoryFilter;
    })
    .filter((item) => {
      if (!searchFilter) {
        return true;
      }
      const haystack = [
        item.name,
        item.description || "",
        item.category?.name || "",
        item.flavor || "",
        item.color || "",
        item.scent || "",
        item.size || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchFilter);
    });

  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 0;
  const paged =
    pageSize > 0
      ? filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
      : filtered;

  return paged.map(mapSupabaseProduct);
}

export async function fetchProductDetail(slug: string): Promise<Product> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(
      "id, name, slug, description, price, stock, flavor, color, scent, size, is_featured, is_active, category:categories(name, slug), images:product_images(original_image, processed_image, is_primary)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Product not found.");
  }

  return mapSupabaseProduct(data);
}

export async function createWhatsAppOrder(
  payload: WhatsAppOrderPayload,
): Promise<WhatsAppOrderResponse> {
  if (!WHATSAPP_ORDER_NUMBER) {
    throw new Error(
      "Missing VITE_WHATSAPP_ORDER_NUMBER. Add your WhatsApp number to checkout.",
    );
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const normalizedItems = payload.items.map((item) => {
    const quantity = Math.max(0, Number(item.quantity || 0));
    const price = Math.max(0, Number(item.price || 0));
    const name = String(item.name || "").trim();

    if (!name || quantity <= 0) {
      throw new Error("Invalid checkout item.");
    }

    return { name, quantity, price };
  });

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  return {
    order_id: `local-${Date.now()}`,
    whatsapp_url: buildOrderWhatsappUrl(
      {
        ...payload,
        items: normalizedItems,
      },
      subtotal,
    ),
    subtotal,
    item_count: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}
