import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class CatalogTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def create_uploaded_image(self, filename="product.png"):
        image_buffer = BytesIO()
        image = Image.new("RGBA", (300, 300), (210, 170, 176, 180))
        image.save(image_buffer, format="PNG")
        return SimpleUploadedFile(
            filename,
            image_buffer.getvalue(),
            content_type="image/png",
        )

    def test_category_endpoint_returns_active_product_counts(self):
        from .models import Category, Product

        category = Category.objects.create(name="Lip Gloss")
        Product.objects.create(
            category=category,
            name="Rose Shine",
            price="120.00",
            stock=4,
            is_active=True,
        )
        Product.objects.create(
            category=category,
            name="Archived Shine",
            price="120.00",
            stock=4,
            is_active=False,
        )

        response = self.client.get("/api/catalog/categories/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload[0]["slug"], category.slug)
        self.assertEqual(payload[0]["product_count"], 1)
        self.assertEqual(
            response["Cache-Control"],
            "public, max-age=600, s-maxage=1800, stale-while-revalidate=300",
        )

    def test_product_image_save_creates_processed_storefront_image(self):
        from .models import Category, Product, ProductImage

        category = Category.objects.create(name="Skincare")
        product = Product.objects.create(
            category=category,
            name="Glow Serum",
            price="250.00",
            stock=10,
        )

        product_image = ProductImage.objects.create(
            product=product,
            original_image=self.create_uploaded_image(),
            is_primary=True,
        )

        self.assertTrue(product_image.processed_image.name.endswith(".webp"))
        self.assertEqual(
            product_image.display_image.name,
            product_image.processed_image.name,
        )
        self.assertTrue(
            product_image.processed_image.storage.exists(
                product_image.processed_image.name
            )
        )

    def test_product_detail_endpoint_returns_absolute_image_urls(self):
        from .models import Category, Product, ProductImage

        category = Category.objects.create(name="Body Care")
        product = Product.objects.create(
            category=category,
            name="Glow Butter",
            description="A rich body butter.",
            price="180.00",
            stock=7,
            is_featured=True,
        )
        ProductImage.objects.create(
            product=product,
            original_image=self.create_uploaded_image("glow-butter.png"),
            is_primary=True,
        )

        response = self.client.get(f"/api/catalog/products/{product.slug}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["category"]["slug"], category.slug)
        self.assertTrue(payload["images"])
        self.assertTrue(
            payload["images"][0]["display_image"].startswith(
                "http://testserver/media/products/processed/"
            )
        )
        self.assertEqual(
            response["Cache-Control"],
            "public, max-age=120, s-maxage=600, stale-while-revalidate=120",
        )
