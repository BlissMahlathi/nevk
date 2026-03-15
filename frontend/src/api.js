import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
});

export async function fetchHealth() {
  const response = await apiClient.get("/api/health/");
  return response.data;
}

export async function fetchCategories() {
  const response = await apiClient.get("/api/catalog/categories/");
  return response.data;
}

export async function fetchFeaturedProducts() {
  const response = await apiClient.get("/api/catalog/products/featured/");
  return response.data;
}

export async function fetchProducts(params, signal) {
  const query = {
    page: params.page,
  };

  if (params.category && params.category !== "all") {
    query.category = params.category;
  }

  if (params.search) {
    query.search = params.search;
  }

  const response = await apiClient.get("/api/catalog/products/", {
    params: query,
    signal,
  });

  return {
    results: response.data?.results ?? [],
    count: response.data?.count ?? 0,
    pageSize: response.data?.results?.length || 12,
  };
}

export async function fetchProductDetail(slug, signal) {
  const response = await apiClient.get(`/api/catalog/products/${slug}/`, {
    signal,
  });
  return response.data;
}
