import { useQuery } from "@tanstack/react-query";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
} from "@/data/products";
import {
  fetchCategories,
  fetchProductDetail,
  fetchProducts,
  type ProductQueryParams,
} from "@/lib/api";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useProductsQuery(
  params: ProductQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["catalog", "products", params],
    queryFn: () => fetchProducts(params),
    enabled,
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useProductDetailQuery(slug?: string) {
  return useQuery({
    queryKey: ["catalog", "product", slug],
    queryFn: () => fetchProductDetail(slug || ""),
    enabled: Boolean(slug),
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export const fallbackCatalogData = {
  categories: fallbackCategories,
  products: fallbackProducts,
};
