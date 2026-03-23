from rest_framework import serializers
from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Full image serializer – returns absolute URLs for both image variants."""
    display_image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            "id", "original_image", "processed_image",
            "display_image", "alt_text", "is_primary",
        ]

    def get_display_image(self, obj):
        """Return the preferred image URL, prioritizing processed assets."""
        request = self.context.get("request")
        image = obj.processed_image if obj.processed_image else obj.original_image
        if image and request:
            return request.build_absolute_uri(image.url)
        return None


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer including active product count."""
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description",
                  "is_active", "product_count"]

    def get_product_count(self, obj):
        """Use annotated count if present, otherwise query active products."""
        annotated_count = getattr(obj, "product_count", None)
        if annotated_count is not None:
            return annotated_count
        return obj.products.filter(is_active=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views – only essential fields."""
    category_name = serializers.CharField(
        source="category.name", read_only=True)
    category_slug = serializers.CharField(
        source="category.slug", read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "stock", "in_stock",
            "flavor", "color", "scent", "size",
            "is_featured", "category_name", "category_slug",
            "primary_image", "created_at",
        ]

    def get_primary_image(self, obj):
        """Return the best available product image URL for list views."""
        request = self.context.get("request")
        img_obj = (
            obj.images.filter(is_primary=True).first()
            or obj.images.first()
        )
        if img_obj:
            image = img_obj.processed_image if img_obj.processed_image else img_obj.original_image
            if image and request:
                return request.build_absolute_uri(image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for single product detail – includes nested category and all images."""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price", "stock", "in_stock",
            "flavor", "color", "scent", "size",
            "is_featured", "is_active",
            "category", "images",
            "created_at", "updated_at",
        ]
