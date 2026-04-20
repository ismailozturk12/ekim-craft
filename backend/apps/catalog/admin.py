from django.contrib import admin

from .models import Category, Product, ProductImage, ProductVariant, Review, ReviewPhoto


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("image", "alt", "sort_order", "is_cover")


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("size_label", "color_name", "color_hex", "sku", "stock", "price_delta", "is_active")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "sort_order", "is_visible")
    list_editable = ("sort_order", "is_visible")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "old_price", "customizable", "rating", "is_visible")
    list_filter = ("category", "customizable", "is_visible")
    list_editable = ("is_visible",)
    search_fields = ("name", "slug", "sku")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductVariantInline]


class ReviewPhotoInline(admin.TabularInline):
    model = ReviewPhoto
    extra = 0


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "author_name", "rating", "is_approved", "is_verified_purchase", "created_at")
    list_filter = ("rating", "is_approved", "is_verified_purchase")
    inlines = [ReviewPhotoInline]
