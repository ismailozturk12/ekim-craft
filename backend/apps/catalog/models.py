"""Katalog: Kategori, Ürün, Varyant, Görsel, Yorum."""

from __future__ import annotations

from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimestampedModel


class Category(TimestampedModel):
    slug = models.SlugField(unique=True, max_length=80)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    image_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Kategori")
        verbose_name_plural = _("Kategoriler")
        ordering = ("sort_order", "name")

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimestampedModel):
    class SizeType(models.TextChoices):
        ONE_SIZE = "one-size", _("Tek beden")
        APPAREL = "apparel", _("Tekstil bedeni")
        NUMERIC_CM = "numeric-cm", _("Santim ölçü")
        PAPER = "paper", _("Kağıt ebadı")

    slug = models.SlugField(unique=True, max_length=120)
    name = models.CharField(max_length=180)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    sku = models.CharField(max_length=40, unique=True, blank=True)
    artisan = models.CharField(max_length=100, default="Ekim Craft")
    artisan_city = models.CharField(max_length=80, default="İstanbul")
    currency = models.CharField(max_length=3, default="TRY")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    materials = models.JSONField(default=list, blank=True)
    care = models.CharField(max_length=255, blank=True)
    lead_time = models.CharField(max_length=40, blank=True, help_text="örn. 3-5 gün")
    tags = models.JSONField(default=list, blank=True)
    customizable = models.BooleanField(default=False)
    size_type = models.CharField(max_length=20, choices=SizeType.choices, default=SizeType.ONE_SIZE)
    stock = models.PositiveIntegerField(default=0, help_text="Varyant yoksa kullanılır")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = _("Ürün")
        verbose_name_plural = _("Ürünler")
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["category", "is_visible"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:120]
        super().save(*args, **kwargs)

    @property
    def total_stock(self) -> int:
        variants = list(self.variants.all())
        if variants:
            return sum(v.stock for v in variants)
        return self.stock

    @property
    def is_in_stock(self) -> bool:
        return self.total_stock > 0


class ProductImage(TimestampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/%Y/%m/", blank=True)
    alt = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Ürün görseli")
        verbose_name_plural = _("Ürün görselleri")
        ordering = ("sort_order", "-created_at")


class ProductVariant(TimestampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size_label = models.CharField(max_length=40, blank=True)
    color_name = models.CharField(max_length=60, blank=True)
    color_hex = models.CharField(max_length=9, blank=True)
    sku = models.CharField(max_length=60, blank=True)
    stock = models.PositiveIntegerField(default=0)
    price_delta = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Varyant")
        verbose_name_plural = _("Varyantlar")
        constraints = [
            models.UniqueConstraint(
                fields=["product", "size_label", "color_name"],
                name="unique_product_variant",
            )
        ]

    def __str__(self) -> str:
        parts = [self.size_label, self.color_name]
        return f"{self.product.name} · {' / '.join(filter(None, parts)) or 'Varsayılan'}"


class Review(TimestampedModel):
    from django.conf import settings as dj_settings

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        dj_settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    author_name = models.CharField(max_length=120, blank=True)
    rating = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    helpful = models.PositiveIntegerField(default=0)
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Yorum")
        verbose_name_plural = _("Yorumlar")
        ordering = ("-created_at",)


class ReviewPhoto(TimestampedModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="reviews/%Y/%m/")


class WishlistItem(TimestampedModel):
    from django.conf import settings as dj_settings

    user = models.ForeignKey(
        dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")

    class Meta:
        verbose_name = _("Favori")
        verbose_name_plural = _("Favoriler")
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="unique_wishlist_item"),
        ]
        ordering = ("-created_at",)
