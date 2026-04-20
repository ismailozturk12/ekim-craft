from django.db.models import Avg, Count
from rest_framework import filters as drf_filters
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Category, Product, Review, WishlistItem
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewSerializer,
    WishlistItemSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Category.objects.filter(is_visible=True)
        .annotate(count=Count("products", filter=None))
        .order_by("sort_order", "name")
    )
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Product.objects.filter(is_visible=True)
        .select_related("category")
        .prefetch_related("images", "variants")
    )
    lookup_field = "slug"
    filterset_class = ProductFilter
    filter_backends = (
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    )
    search_fields = ("name", "description", "tags", "artisan")
    ordering_fields = ("price", "rating", "created_at", "review_count")
    ordering = ("-created_at",)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        filterset = self.filterset_class(self.request.GET, queryset=queryset)
        if filterset.is_valid():
            queryset = filterset.qs
        return queryset

    @action(detail=True, methods=["get", "post"])
    def reviews(self, request, slug=None):
        product = self.get_object()

        if request.method == "POST":
            if not request.user.is_authenticated:
                return Response({"detail": "Giriş gerekli"}, status=status.HTTP_401_UNAUTHORIZED)
            rating = int(request.data.get("rating", 0))
            if rating < 1 or rating > 5:
                return Response({"rating": "1-5 arası olmalı"}, status=status.HTTP_400_BAD_REQUEST)
            body = (request.data.get("body") or "").strip()
            if len(body) < 10:
                return Response({"body": "En az 10 karakter"}, status=status.HTTP_400_BAD_REQUEST)

            # Yorumu kullanıcının satın alıp almadığına bak
            has_purchased = product.orderitem_set.filter(
                order__user=request.user,
                order__status__in=["paid", "confirmed", "in_production", "shipped", "delivered"],
            ).exists()

            review = Review.objects.create(
                product=product,
                user=request.user,
                author_name=f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
                rating=rating,
                title=request.data.get("title", "")[:200],
                body=body,
                is_verified_purchase=has_purchased,
                is_approved=True,
            )
            # Aggregate update
            stats = product.reviews.filter(is_approved=True).aggregate(
                avg=Avg("rating"),
                n=Count("id"),
            )
            product.rating = round(stats["avg"] or 0, 2)
            product.review_count = stats["n"]
            product.save(update_fields=["rating", "review_count", "updated_at"])
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

        qs = product.reviews.filter(is_approved=True)
        page = self.paginate_queryset(qs)
        ser = ReviewSerializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(ser.data)
        return Response(ser.data)


class WishlistViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Kullanıcının favorileri."""

    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return (
            WishlistItem.objects.filter(user=self.request.user)
            .select_related("product", "product__category")
            .prefetch_related("product__images", "product__variants")
        )

    def create(self, request, *args, **kwargs):
        product = None
        if request.data.get("product_slug"):
            product = Product.objects.filter(slug=request.data["product_slug"]).first()
        elif request.data.get("product"):
            product = Product.objects.filter(pk=request.data["product"]).first()
        if not product:
            return Response({"product": "Ürün bulunamadı"}, status=status.HTTP_400_BAD_REQUEST)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        ser = WishlistItemSerializer(item, context={"request": request})
        return Response(ser.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=["delete"], url_path=r"by-product/(?P<slug>[\w-]+)")
    def remove_by_product(self, request, slug=None):
        qs = WishlistItem.objects.filter(user=request.user, product__slug=slug)
        count = qs.count()
        qs.delete()
        return Response({"removed": count}, status=status.HTTP_200_OK)
