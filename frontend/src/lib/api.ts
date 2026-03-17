import type { Category, Product } from "@/data/products";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
} from "@/data/products";

const DEFAULT_API_BASE_URL = "https://nevk.onrender.com/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  product_count?: number;
}

interface BackendProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  stock: number;
  in_stock: boolean;
  flavor?: string;
  color?: string;
  scent?: string;
  size?: string;
  is_featured: boolean;
  category_name?: string;
  category_slug?: string;
  primary_image?: string | null;
}

interface BackendProductImage {
  id: number;
  original_image?: string | null;
  processed_image?: string | null;
  display_image?: string | null;
  alt_text?: string;
  is_primary: boolean;
}

interface BackendProductDetail extends BackendProductListItem {
  description: string;
  is_active: boolean;
  category?: BackendCategory;
  images?: BackendProductImage[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
  order_id: number;
  whatsapp_url: string;
  subtotal: number;
  item_count: number;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = Boolean(init?.body);
  const defaultHeaders: HeadersInit = hasBody
    ? { "Content-Type": "application/json" }
    : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `API request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
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

function mapBackendCategory(category: BackendCategory): Category {
  const fallbackCategory = fallbackCategoryBySlug.get(category.slug);

  return {
    name: category.name,
    slug: category.slug,
    description: category.description || fallbackCategory?.description || "",
    isActive: category.is_active,
    image: fallbackCategory?.image,
  };
}

function mapBackendProductList(item: BackendProductListItem): Product {
  const fallbackProduct = fallbackProductBySlug.get(item.slug);
  const image = pickProductImage({
    slug: item.slug,
    categorySlug: item.category_slug,
    primaryImage: item.primary_image,
  });

  return {
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    description: fallbackProduct?.description || "",
    price: Number(item.price),
    category:
      item.category_name || fallbackProduct?.category || "Uncategorized",
    categorySlug: item.category_slug || fallbackProduct?.categorySlug || "",
    image,
    images: image ? [image] : [],
    flavor: item.flavor || fallbackProduct?.flavor,
    color: item.color || fallbackProduct?.color,
    scent: item.scent || fallbackProduct?.scent,
    size: item.size || fallbackProduct?.size,
    isFeatured: item.is_featured,
    isActive: true,
    stock: item.stock,
  };
}

function mapBackendProductDetail(item: BackendProductDetail): Product {
  const fallbackProduct = fallbackProductBySlug.get(item.slug);
  const images =
    item.images
      ?.map(
        (imageItem) =>
          imageItem.display_image ||
          imageItem.processed_image ||
          imageItem.original_image ||
          "",
      )
      .filter(Boolean) || [];

  const categorySlug =
    item.category?.slug ||
    item.category_slug ||
    fallbackProduct?.categorySlug ||
    "";
  const categoryName =
    item.category?.name ||
    item.category_name ||
    fallbackProduct?.category ||
    "Uncategorized";
  const image = pickProductImage({
    slug: item.slug,
    categorySlug,
    primaryImage: item.primary_image,
    images,
  });

  return {
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    description: item.description || fallbackProduct?.description || "",
    price: Number(item.price),
    category: categoryName,
    categorySlug,
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    flavor: item.flavor || fallbackProduct?.flavor,
    color: item.color || fallbackProduct?.color,
    scent: item.scent || fallbackProduct?.scent,
    size: item.size || fallbackProduct?.size,
    isFeatured: item.is_featured,
    isActive: item.is_active,
    stock: item.stock,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const categories = await apiRequest<BackendCategory[]>(
    "/catalog/categories/",
  );
  return categories
    .map(mapBackendCategory)
    .filter((category) => category.isActive);
}

export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.featured) {
    query.set("featured", "true");
  }

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.pageSize) {
    query.set("page_size", String(params.pageSize));
  }

  const isFeaturedEndpoint =
    params.featured && !params.search && !params.category;
  const path = isFeaturedEndpoint
    ? "/catalog/products/featured/"
    : `/catalog/products/${query.size ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<
    PaginatedResponse<BackendProductListItem> | BackendProductListItem[]
  >(path);

  if (Array.isArray(response)) {
    return response.map(mapBackendProductList);
  }

  return response.results.map(mapBackendProductList);
}

export async function fetchProductDetail(slug: string): Promise<Product> {
  const response = await apiRequest<BackendProductDetail>(
    `/catalog/products/${slug}/`,
  );
  return mapBackendProductDetail(response);
}

export async function createWhatsAppOrder(
  payload: WhatsAppOrderPayload,
): Promise<WhatsAppOrderResponse> {
  return apiRequest<WhatsAppOrderResponse>("/orders/whatsapp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
