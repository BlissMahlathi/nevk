from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage


class InventoryStatusFilter(admin.SimpleListFilter):
    title = "inventory"
    parameter_name = "inventory"

    def lookups(self, request, model_admin):
        return (
            ("low", "Low stock (< 5)"),
            ("out", "Out of stock"),
            ("in", "In stock"),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "low":
            return queryset.filter(stock__gt=0, stock__lt=5)
        if value == "out":
            return queryset.filter(stock=0)
        if value == "in":
            return queryset.filter(stock__gt=0)
        return queryset


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("original_image", "processed_image",
              "alt_text", "is_primary", "preview", "created_at")
    readonly_fields = ("preview", "created_at")

    def preview(self, obj):
        image = obj.processed_image or obj.original_image
        if obj.pk and image:
            return format_html(
                '<img src="{}" style="height:56px;border-radius:4px;object-fit:cover;" />',
                image.url,
            )
        return "—"
    preview.short_description = "Preview"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active",
                    "active_products", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_per_page = 25
    ordering = ("name",)
    actions = ("activate_categories", "deactivate_categories")

    @admin.action(description="Activate selected categories")
    def activate_categories(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Activated {updated} categor{('y' if updated == 1 else 'ies')}.")

    @admin.action(description="Deactivate selected categories")
    def deactivate_categories(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {updated} categor{('y' if updated == 1 else 'ies')}.")

    def active_products(self, obj):
        return obj.products.filter(is_active=True).count()
    active_products.short_description = "Active Products"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "price", "stock", "in_stock",
        "is_featured", "is_active", "thumbnail", "updated_at",
    )
    list_filter = (
        "is_active",
        "is_featured",
        "category",
        InventoryStatusFilter,
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "slug", "description", "flavor", "color", "scent", "size")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "stock", "is_featured", "is_active")
    list_select_related = ("category",)
    autocomplete_fields = ("category",)
    list_per_page = 25
    date_hierarchy = "updated_at"
    save_on_top = True
    actions = (
        "mark_as_featured",
        "remove_featured_flag",
        "activate_products",
        "deactivate_products",
    )
    readonly_fields = ("created_at", "updated_at")
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
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(boolean=True, description="In Stock")
    def in_stock(self, obj):
        return obj.stock > 0

    @admin.action(description="Mark selected products as featured")
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"Marked {updated} product(s) as featured.")

    @admin.action(description="Remove featured flag")
    def remove_featured_flag(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f"Removed featured flag from {updated} product(s).")

    @admin.action(description="Activate selected products")
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Activated {updated} product(s).")

    @admin.action(description="Deactivate selected products")
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {updated} product(s).")

    def thumbnail(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        image = None
        if primary:
            image = primary.processed_image or primary.original_image
        if image:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;" />',
                image.url,
            )
        return "—"
    thumbnail.short_description = "Image"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_primary", "preview", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("product__name", "product__slug", "alt_text")
    autocomplete_fields = ("product",)
    list_select_related = ("product",)
    list_per_page = 50
    date_hierarchy = "created_at"
    actions = ("regenerate_processed_images", "set_as_primary")

    def preview(self, obj):
        image = obj.processed_image or obj.original_image
        if image:
            return format_html(
                '<img src="{}" style="height:50px;border-radius:4px;object-fit:cover;" />',
                image.url,
            )
        return "—"
    preview.short_description = "Preview"

    @admin.action(description="Regenerate processed images")
    def regenerate_processed_images(self, request, queryset):
        updated_count = 0
        for image in queryset:
            if image.original_image:
                image.regenerate_processed_image()
                updated_count += 1

        self.message_user(
            request,
            f"Regenerated processed images for {updated_count} record(s).",
        )

    @admin.action(description="Set selected image(s) as primary")
    def set_as_primary(self, request, queryset):
        updated_count = 0
        for image in queryset.select_related("product"):
            ProductImage.objects.filter(product=image.product, is_primary=True).update(is_primary=False)
            if not image.is_primary:
                image.is_primary = True
                image.save(update_fields=["is_primary"])
                updated_count += 1

        self.message_user(request, f"Updated primary image on {updated_count} product(s).")
