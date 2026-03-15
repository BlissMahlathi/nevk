class ApiCacheControlMiddleware:
    """Apply cache-control headers for read-heavy API endpoints."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path

        if not path.startswith("/api/"):
            return response

        if request.method not in ("GET", "HEAD") or response.status_code >= 400:
            response["Cache-Control"] = "no-store"
            self._merge_vary(
                response, ["Origin", "Accept-Encoding", "Authorization"])
            return response

        if path.startswith("/api/catalog/categories/"):
            cache_control = "public, max-age=600, s-maxage=1800, stale-while-revalidate=300"
        elif path.startswith("/api/catalog/products/featured/"):
            cache_control = "public, max-age=300, s-maxage=900, stale-while-revalidate=180"
        elif path.startswith("/api/catalog/products/") or path.startswith("/api/catalog/product/"):
            cache_control = "public, max-age=120, s-maxage=600, stale-while-revalidate=120"
        elif path.startswith("/api/health/"):
            cache_control = "no-store"
        else:
            cache_control = "private, no-store"

        response["Cache-Control"] = cache_control
        self._merge_vary(response, ["Origin", "Accept-Encoding"])
        return response

    @staticmethod
    def _merge_vary(response, values):
        existing = [token.strip() for token in response.get(
            "Vary", "").split(",") if token.strip()]
        for value in values:
            if value not in existing:
                existing.append(value)
        if existing:
            response["Vary"] = ", ".join(existing)
