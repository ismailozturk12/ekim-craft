"""Order serializer'ları — checkout + list + detay."""

from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework import serializers

from apps.catalog.models import Product, ProductVariant

from .models import Order, OrderEvent, OrderItem


# ------------------------------------------------------------
# Read / list
# ------------------------------------------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.SlugField(source="product.slug", read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_slug",
            "variant",
            "name_snapshot",
            "size_snapshot",
            "color_snapshot",
            "qty",
            "unit_price",
            "personalization",
        )


class OrderEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderEvent
        fields = ("id", "event_type", "status", "note", "created_at")


class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "number",
            "status",
            "payment_method",
            "shipping_method",
            "subtotal",
            "shipping_cost",
            "total",
            "currency",
            "tracking_number",
            "carrier",
            "created_at",
            "items_count",
        )

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    events = OrderEventSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "number",
            "status",
            "payment_method",
            "payment_status",
            "shipping_method",
            "shipping_address",
            "billing_address",
            "subtotal",
            "shipping_cost",
            "discount",
            "tax",
            "total",
            "currency",
            "tracking_number",
            "carrier",
            "estimated_delivery",
            "note",
            "items",
            "events",
            "created_at",
        )


# ------------------------------------------------------------
# Create (checkout)
# ------------------------------------------------------------
class CheckoutItemSerializer(serializers.Serializer):
    product_slug = serializers.SlugField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    qty = serializers.IntegerField(min_value=1)
    size = serializers.CharField(required=False, allow_blank=True, default="")
    color = serializers.CharField(required=False, allow_blank=True, default="")
    personalization = serializers.JSONField(required=False, default=dict)


class CheckoutAddressSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    line = serializers.CharField(max_length=255)
    district = serializers.CharField(max_length=80, required=False, allow_blank=True)
    city = serializers.CharField(max_length=80)
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True)


class CheckoutSerializer(serializers.Serializer):
    items = CheckoutItemSerializer(many=True)
    shipping_address = CheckoutAddressSerializer()
    shipping_method = serializers.ChoiceField(
        choices=Order.ShippingMethod.choices, default=Order.ShippingMethod.STANDARD
    )
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.CARD
    )
    note = serializers.CharField(required=False, allow_blank=True, default="")
    coupon_code = serializers.CharField(required=False, allow_blank=True, default="")

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user if request.user.is_authenticated else None

        # Sipariş numarası EK-XXXXX (unique)
        while True:
            number = f"EK-{get_random_string(5, '0123456789')}"
            if not Order.objects.filter(number=number).exists():
                break

        subtotal = Decimal("0.00")
        line_data = []
        for raw in validated_data["items"]:
            try:
                product = Product.objects.get(slug=raw["product_slug"])
            except Product.DoesNotExist as exc:
                raise serializers.ValidationError({"items": f"Ürün bulunamadı: {raw['product_slug']}"}) from exc

            variant = None
            if raw.get("variant_id"):
                variant = ProductVariant.objects.filter(pk=raw["variant_id"], product=product).first()

            unit_price = product.price + (variant.price_delta if variant else Decimal("0.00"))
            subtotal += unit_price * raw["qty"]
            line_data.append(
                {
                    "product": product,
                    "variant": variant,
                    "raw": raw,
                    "unit_price": unit_price,
                }
            )

        shipping = Decimal("0.00")
        method = validated_data["shipping_method"]
        if method == Order.ShippingMethod.STANDARD:
            shipping = Decimal("0.00") if subtotal >= 500 else Decimal("49.90")
        elif method == Order.ShippingMethod.EXPRESS:
            shipping = Decimal("89.00")

        total = subtotal + shipping

        order = Order.objects.create(
            number=number,
            user=user,
            guest_email=validated_data["shipping_address"].get("email", "") if not user else "",
            status=Order.Status.PENDING,
            payment_method=validated_data["payment_method"],
            payment_status="pending",
            shipping_method=method,
            shipping_address=validated_data["shipping_address"],
            subtotal=subtotal,
            shipping_cost=shipping,
            total=total,
            note=validated_data.get("note", ""),
        )

        for entry in line_data:
            OrderItem.objects.create(
                order=order,
                product=entry["product"],
                variant=entry["variant"],
                name_snapshot=entry["product"].name,
                size_snapshot=entry["raw"].get("size", ""),
                color_snapshot=entry["raw"].get("color", ""),
                qty=entry["raw"]["qty"],
                unit_price=entry["unit_price"],
                personalization=entry["raw"].get("personalization", {}),
            )

        OrderEvent.objects.create(
            order=order, event_type="placed", status="pending", note="Sipariş alındı"
        )

        return order


class OrderCreateResponseSerializer(OrderDetailSerializer):
    """Checkout response — detail serializer ile aynı."""


# ------------------------------------------------------------
# Admin update
# ------------------------------------------------------------
class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    """Admin'in güncelleyebileceği alanlar — PATCH /orders/{number}/"""

    class Meta:
        model = Order
        fields = (
            "status",
            "payment_status",
            "tracking_number",
            "carrier",
            "estimated_delivery",
            "note",
        )
        extra_kwargs = {k: {"required": False} for k in fields}
