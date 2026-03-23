from django.conf import settings
from django.http import Http404


class AdminAccessControlMiddleware:
    """Restrict admin access using host/IP allowlists and a custom admin path."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        admin_prefix = f"/{settings.ADMIN_URL}"
        if request.path.startswith(admin_prefix):
            # Optional host allowlist (useful with admin-only subdomain).
            if settings.ADMIN_ALLOWED_HOSTS:
                host = request.get_host().split(":", 1)[0]
                if host not in settings.ADMIN_ALLOWED_HOSTS:
                    raise Http404

            # Optional IP allowlist (best when behind static office/VPN egress IP).
            if settings.ADMIN_ALLOWED_IPS:
                client_ip = self._get_client_ip(request)
                if client_ip not in settings.ADMIN_ALLOWED_IPS:
                    raise Http404

        return self.get_response(request)

    @staticmethod
    def _get_client_ip(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")


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

        if path.startswith("/api/health/"):
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
