"""Admin product CRUD + image upload + variant CRUD."""

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Product, ProductImage, ProductVariant
from .serializers import (
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
    ProductVariantSerializer,
)


class AdminProductViewSet(viewsets.ModelViewSet):
    """Admin paneli için tam CRUD + görsel yönetimi."""

    queryset = Product.objects.select_related("category").prefetch_related("images", "variants")
    lookup_field = "slug"
    permission_classes = (permissions.IsAdminUser,)
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get_serializer_class(self):
        if self.action in ("retrieve", "create", "update", "partial_update"):
            return ProductDetailSerializer
        return ProductListSerializer

    @action(
        detail=True,
        methods=["post"],
        url_path="images",
        parser_classes=(MultiPartParser, FormParser),
    )
    def upload_image(self, request, slug=None):
        product = self.get_object()
        files = request.FILES.getlist("image") or ([request.FILES["image"]] if "image" in request.FILES else [])
        if not files:
            return Response({"image": "Dosya gerekli"}, status=status.HTTP_400_BAD_REQUEST)

        existing_count = product.images.count()
        created = []
        for i, f in enumerate(files):
            img = ProductImage.objects.create(
                product=product,
                image=f,
                alt=request.data.get("alt", ""),
                sort_order=existing_count + i,
                is_cover=(existing_count == 0 and i == 0),
            )
            created.append(img)

        ser = ProductImageSerializer(created, many=True, context={"request": request})
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AdminProductImageViewSet(viewsets.GenericViewSet):
    """Tek görsel için: set-cover, delete."""

    queryset = ProductImage.objects.select_related("product")
    serializer_class = ProductImageSerializer
    permission_classes = (permissions.IsAdminUser,)

    def destroy(self, request, pk=None):
        img = self.get_object()
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="set-cover")
    def set_cover(self, request, pk=None):
        img = self.get_object()
        ProductImage.objects.filter(product=img.product).update(is_cover=False)
        img.is_cover = True
        img.save(update_fields=["is_cover", "updated_at"])
        return Response(ProductImageSerializer(img, context={"request": request}).data)


class AdminProductVariantViewSet(viewsets.ModelViewSet):
    """Ürün varyantları (beden/renk/stok)."""

    serializer_class = ProductVariantSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        qs = ProductVariant.objects.select_related("product")
        product_slug = self.request.query_params.get("product")
        if product_slug:
            qs = qs.filter(product__slug=product_slug)
        return qs.order_by("product_id", "size_label", "color_name")

    def create(self, request, *args, **kwargs):
        product_slug = request.data.get("product_slug")
        if not product_slug:
            return Response({"product_slug": "Zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(slug=product_slug)
        except Product.DoesNotExist:
            return Response({"product_slug": "Ürün bulunamadı"}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "size_label": request.data.get("size_label", ""),
            "color_name": request.data.get("color_name", ""),
            "color_hex": request.data.get("color_hex", ""),
            "sku": request.data.get("sku", ""),
            "stock": int(request.data.get("stock", 0)),
            "price_delta": request.data.get("price_delta", "0"),
            "is_active": request.data.get("is_active", True),
        }
        try:
            variant = ProductVariant.objects.create(product=product, **data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            ProductVariantSerializer(variant).data, status=status.HTTP_201_CREATED
        )

