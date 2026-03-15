from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    FeaturedProductListView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    # featured must be declared before <slug> to avoid slug capturing "featured"
    path("products/featured/", FeaturedProductListView.as_view(),
         name="featured-products"),
    path("product/<slug:slug>/", ProductDetailView.as_view(), name="product-detail-legacy"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
]
