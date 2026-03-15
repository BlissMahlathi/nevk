from django.db import models
from django.utils.text import slugify

from .image_processing import build_processed_product_image


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    # SET_NULL preserves products when a category is deleted
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)

    flavor = models.CharField(max_length=120, blank=True)
    color = models.CharField(max_length=120, blank=True)
    scent = models.CharField(max_length=120, blank=True)
    size = models.CharField(max_length=120, blank=True)

    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        return self.stock > 0

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images")
    original_image = models.ImageField(upload_to="products/raw/")
    processed_image = models.ImageField(
        upload_to="products/processed/", blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def save(self, *args, **kwargs):
        previous_original_name = None
        if self.pk:
            previous_original_name = (
                type(self)
                .objects.filter(pk=self.pk)
                .values_list("original_image", flat=True)
                .first()
            )

        original_changed = previous_original_name != self.original_image.name
        should_generate_processed = bool(self.original_image) and (
            not self.processed_image or original_changed
        )

        super().save(*args, **kwargs)

        if should_generate_processed:
            self.regenerate_processed_image()

    def regenerate_processed_image(self):
        if not self.original_image:
            return
        processed_name, processed_file = build_processed_product_image(
            self.original_image
        )
        self.processed_image.save(processed_name, processed_file, save=False)
        super().save(update_fields=["processed_image"])

    @property
    def display_image(self):
        """Return processed image if available, fall back to original."""
        return self.processed_image if self.processed_image else self.original_image

    def __str__(self):
        label = "Primary" if self.is_primary else "Image"
        return f"{self.product.name} {label}"
