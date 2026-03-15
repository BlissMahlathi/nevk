from django.db.models import Count, Q
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class StandardPagination(PageNumberPagination):
    """12 products per page; client can override up to 48."""
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48


class CategoryListView(ListAPIView):
    """GET /api/catalog/categories/ — returns all active categories with product counts."""
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [AllowAny]
    throttle_scope = "catalog"

    def get_queryset(self):
        return Category.objects.filter(is_active=True).annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        ).order_by("name")


class ProductListView(ListAPIView):
    """
    GET /api/catalog/products/
    Query params:
      - category  (slug)
      - search    (name / description / flavor / color / scent)
      - featured  (true | 1)
    """
    serializer_class = ProductListSerializer
    pagination_class = StandardPagination
    permission_classes = [AllowAny]
    throttle_scope = "catalog"

    def get_queryset(self):
        qs = (
            Product.objects
            .filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )

        category_slug = self.request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(flavor__icontains=search)
                | Q(color__icontains=search)
                | Q(scent__icontains=search)
            )

        if self.request.query_params.get("featured") in ("true", "1"):
            qs = qs.filter(is_featured=True)

        return qs


class ProductDetailView(RetrieveAPIView):
    """GET /api/catalog/products/<slug>/ — full product detail."""
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]
    throttle_scope = "catalog"

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )


class FeaturedProductListView(ListAPIView):
    """GET /api/catalog/products/featured/ — up to 8 featured products, no pagination."""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    throttle_scope = "catalog"

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True, is_featured=True)
            .select_related("category")
            .prefetch_related("images")
        )[:8]
