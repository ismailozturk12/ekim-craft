from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductVariant, Review, WishlistItem


class CategorySerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "slug",
            "name",
            "description",
            "parent",
            "image_url",
            "sort_order",
            "is_visible",
            "count",
        )


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt", "sort_order", "is_cover")

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "size_label",
            "color_name",
            "color_hex",
            "sku",
            "stock",
            "price_delta",
            "is_active",
        )


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = (
            "id",
            "product",
            "author_name",
            "rating",
            "title",
            "body",
            "helpful",
            "is_verified_purchase",
            "created_at",
        )
        read_only_fields = ("helpful", "is_verified_purchase", "created_at")


class ProductListSerializer(serializers.ModelSerializer):
    """Liste ekranları için hafif sürüm."""

    category_slug = serializers.SlugField(source="category.slug", read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "name",
            "category",
            "category_slug",
            "artisan",
            "artisan_city",
            "currency",
            "price",
            "old_price",
            "rating",
            "review_count",
            "tags",
            "customizable",
            "size_type",
            "stock",
            "cover_image",
            "is_visible",
            "updated_at",
        )

    def get_cover_image(self, obj):
        cover = next((i for i in obj.images.all() if i.is_cover), None) or obj.images.first()
        if not cover or not cover.image:
            return None
        request = self.context.get("request")
        url = cover.image.url
        return request.build_absolute_uri(url) if request else url


class ProductDetailSerializer(serializers.ModelSerializer):
    """Ürün detay ekranı için tam sürüm."""

    category_slug = serializers.SlugField(source="category.slug", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(source="is_in_stock", read_only=True)
    # Model'in save() metodu slug'ı name'den otomatik üretir — create'te zorunlu tutma
    slug = serializers.SlugField(required=False, allow_blank=True)
    sku = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "name",
            "category",
            "category_slug",
            "sku",
            "artisan",
            "artisan_city",
            "currency",
            "price",
            "old_price",
            "description",
            "materials",
            "care",
            "lead_time",
            "tags",
            "customizable",
            "size_type",
            "stock",
            "rating",
            "review_count",
            "total_stock",
            "in_stock",
            "images",
            "variants",
            "seo_title",
            "seo_description",
        )


class WishlistItemSerializer(serializers.ModelSerializer):
    """Favori — product detay inline."""

    product_detail = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_detail", "created_at")
        read_only_fields = ("id", "product_detail", "created_at")

    def get_product_detail(self, obj):
        return ProductListSerializer(obj.product, context=self.context).data

