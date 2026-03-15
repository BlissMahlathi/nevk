from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("original_image", "processed_image",
              "alt_text", "is_primary", "preview")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.pk and obj.original_image:
            return format_html(
                '<img src="{}" style="height:56px;border-radius:4px;object-fit:cover;" />',
                obj.original_image.url,
            )
        return "—"
    preview.short_description = "Preview"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active",
                    "active_products", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    def active_products(self, obj):
        return obj.products.filter(is_active=True).count()
    active_products.short_description = "Active Products"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "price", "stock",
        "is_featured", "is_active", "thumbnail", "updated_at",
    )
    list_filter = ("is_active", "is_featured", "category")
    search_fields = ("name", "description", "flavor", "color", "scent")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "stock", "is_featured", "is_active")
    inlines = [ProductImageInline]
    fieldsets = (
        ("Product Info", {
            "fields": ("category", "name", "slug", "description", "price", "stock"),
        }),
        ("Attributes", {
            "fields": ("flavor", "color", "scent", "size"),
            "classes": ("collapse",),
        }),
        ("Visibility", {
            "fields": ("is_featured", "is_active"),
        }),
    )

    def thumbnail(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary and primary.original_image:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;" />',
                primary.original_image.url,
            )
        return "—"
    thumbnail.short_description = "Image"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_primary", "preview", "created_at")
    list_filter = ("is_primary",)
    search_fields = ("product__name",)

    def preview(self, obj):
        if obj.original_image:
            return format_html(
                '<img src="{}" style="height:50px;border-radius:4px;object-fit:cover;" />',
                obj.original_image.url,
            )
        return "—"
    preview.short_description = "Preview"
