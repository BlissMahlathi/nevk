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
