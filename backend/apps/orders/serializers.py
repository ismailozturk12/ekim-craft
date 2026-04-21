"""Order serializer'ları — checkout + list + detay."""

from __future__ import annotations

from decimal import Decimal

from django.db import models, transaction
from django.utils.crypto import get_random_string
from rest_framework import serializers

from apps.catalog.models import Product, ProductVariant

from .models import Order, OrderEvent, OrderItem, ReturnRequest, ReturnRequestItem


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

        # Kupon uygula — race condition için select_for_update
        from django.utils import timezone

        from .models import Coupon

        discount = Decimal("0.00")
        coupon_obj = None
        coupon_code = (validated_data.get("coupon_code") or "").strip().upper()
        if coupon_code:
            coupon_obj = (
                Coupon.objects.select_for_update()
                .filter(code__iexact=coupon_code, is_active=True)
                .first()
            )
            if coupon_obj:
                now = timezone.now()
                valid = True
                if coupon_obj.starts_at and coupon_obj.starts_at > now:
                    valid = False
                if coupon_obj.expires_at and coupon_obj.expires_at < now:
                    valid = False
                if (
                    coupon_obj.usage_limit
                    and coupon_obj.used_count >= coupon_obj.usage_limit
                ):
                    valid = False
                if coupon_obj.min_order and subtotal < coupon_obj.min_order:
                    valid = False
                if not valid:
                    coupon_obj = None
            if coupon_obj:
                if coupon_obj.type == Coupon.Type.PERCENT:
                    discount = (subtotal * coupon_obj.value / Decimal("100")).quantize(Decimal("0.01"))
                elif coupon_obj.type == Coupon.Type.FIXED:
                    discount = min(subtotal, coupon_obj.value).quantize(Decimal("0.01"))
                elif coupon_obj.type == Coupon.Type.FREE_SHIP:
                    shipping = Decimal("0.00")

        total = max(Decimal("0.00"), subtotal - discount + shipping)

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
            discount=discount,
            total=total,
            coupon=coupon_obj,
            note=validated_data.get("note", ""),
        )

        if coupon_obj:
            coupon_obj.used_count = (coupon_obj.used_count or 0) + 1
            coupon_obj.save(update_fields=["used_count"])

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

        # Sipariş onay e-postası
        try:
            from apps.notifications.email import send_email

            recipient = order.user.email if order.user_id else order.guest_email
            if recipient:
                items_lines = []
                for entry in line_data:
                    line = f"  • {entry['product'].name} × {entry['raw']['qty']}"
                    extras = []
                    if entry["raw"].get("size"):
                        extras.append(entry["raw"]["size"])
                    if entry["raw"].get("color"):
                        extras.append(entry["raw"]["color"])
                    if extras:
                        line += f" ({', '.join(extras)})"
                    items_lines.append(line)
                payment_labels = dict(Order.PaymentMethod.choices)
                shipping_labels = dict(Order.ShippingMethod.choices)
                send_email(
                    "order_placed",
                    to=recipient,
                    ctx={
                        "recipient_name": validated_data["shipping_address"].get("name", "müşterimiz"),
                        "order_number": order.number,
                        "total": f"{total:.2f}",
                        "payment_method": payment_labels.get(method := order.payment_method, method),
                        "shipping_method": shipping_labels.get(
                            sm := order.shipping_method, sm
                        ),
                        "items_summary": "\n".join(items_lines) or "  (Detay yok)",
                    },
                )
        except Exception:
            pass

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


# ------------------------------------------------------------
# Returns
# ------------------------------------------------------------
class ReturnRequestItemSerializer(serializers.ModelSerializer):
    name_snapshot = serializers.CharField(source="order_item.name_snapshot", read_only=True)
    size_snapshot = serializers.CharField(source="order_item.size_snapshot", read_only=True)
    color_snapshot = serializers.CharField(source="order_item.color_snapshot", read_only=True)
    product_slug = serializers.SlugField(source="order_item.product.slug", read_only=True)

    class Meta:
        model = ReturnRequestItem
        fields = (
            "id",
            "order_item",
            "product_slug",
            "name_snapshot",
            "size_snapshot",
            "color_snapshot",
            "qty",
            "unit_price",
        )


class ReturnRequestListSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.number", read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = ReturnRequest
        fields = (
            "id",
            "number",
            "order_number",
            "status",
            "resolution",
            "reason",
            "refund_amount",
            "items_count",
            "created_at",
        )

    def get_items_count(self, obj):
        return obj.items.count()


class ReturnRequestDetailSerializer(serializers.ModelSerializer):
    items = ReturnRequestItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source="order.number", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True, allow_null=True)

    class Meta:
        model = ReturnRequest
        fields = (
            "id",
            "number",
            "order",
            "order_number",
            "user",
            "user_email",
            "status",
            "resolution",
            "reason",
            "customer_note",
            "admin_note",
            "refund_amount",
            "return_shipping_label",
            "tracking_number",
            "processed_at",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "number",
            "status",
            "admin_note",
            "refund_amount",
            "return_shipping_label",
            "tracking_number",
            "processed_at",
        )


class ReturnRequestCreateSerializer(serializers.Serializer):
    """Müşterinin iade talebi oluşturması için input."""

    order_number = serializers.CharField()
    resolution = serializers.ChoiceField(
        choices=ReturnRequest.Resolution.choices, default=ReturnRequest.Resolution.REFUND
    )
    reason = serializers.ChoiceField(choices=ReturnRequest.Reason.choices)
    customer_note = serializers.CharField(required=False, allow_blank=True, default="")
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
        help_text="[{order_item_id: int, qty: int}]",
    )

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user if request.user.is_authenticated else None

        try:
            order = Order.objects.get(number=attrs["order_number"])
        except Order.DoesNotExist as exc:
            raise serializers.ValidationError({"order_number": "Sipariş bulunamadı"}) from exc

        if user and order.user_id and order.user_id != user.id:
            raise serializers.ValidationError({"order_number": "Bu siparişe erişim yok"})

        if order.status not in {
            Order.Status.PAID,
            Order.Status.CONFIRMED,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        }:
            raise serializers.ValidationError(
                {"order_number": "Bu sipariş durumunda iade açılamaz"}
            )

        order_item_ids = [int(x.get("order_item_id", 0)) for x in attrs["items"]]
        order_items = {oi.id: oi for oi in order.items.filter(id__in=order_item_ids)}
        if len(order_items) != len(set(order_item_ids)):
            raise serializers.ValidationError({"items": "Geçersiz kalem"})

        # Mevcut iade talebinde çift kalem olmamalı (stok kontrolü basit)
        total_requested = {oi_id: 0 for oi_id in order_items}
        for raw in attrs["items"]:
            oi_id = int(raw.get("order_item_id", 0))
            qty = int(raw.get("qty", 0))
            if qty <= 0:
                raise serializers.ValidationError({"items": "Adet 1'den az olamaz"})
            total_requested[oi_id] = total_requested.get(oi_id, 0) + qty

        for oi_id, qty in total_requested.items():
            oi = order_items[oi_id]
            already_requested = (
                ReturnRequestItem.objects.filter(
                    order_item=oi,
                    request__status__in=[
                        ReturnRequest.Status.PENDING,
                        ReturnRequest.Status.APPROVED,
                        ReturnRequest.Status.RECEIVED,
                        ReturnRequest.Status.REFUNDED,
                    ],
                ).aggregate(total=models.Sum("qty"))["total"]
                or 0
            )
            if already_requested + qty > oi.qty:
                raise serializers.ValidationError(
                    {"items": f"'{oi.name_snapshot}' için toplam adet ürün sayısını aşıyor"}
                )

        attrs["_order"] = order
        attrs["_order_items"] = order_items
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        from django.utils.timezone import now

        order = validated_data["_order"]
        order_items = validated_data["_order_items"]

        number = _generate_return_number()
        refund_amount = Decimal("0.00")

        req = ReturnRequest.objects.create(
            number=number,
            order=order,
            user=order.user,
            status=ReturnRequest.Status.PENDING,
            resolution=validated_data["resolution"],
            reason=validated_data["reason"],
            customer_note=validated_data.get("customer_note", ""),
        )

        for raw in validated_data["items"]:
            oi = order_items[int(raw["order_item_id"])]
            qty = int(raw["qty"])
            ReturnRequestItem.objects.create(
                request=req, order_item=oi, qty=qty, unit_price=oi.unit_price
            )
            refund_amount += oi.unit_price * qty

        req.refund_amount = refund_amount
        req.save(update_fields=["refund_amount"])

        OrderEvent.objects.create(
            order=order,
            event_type="return_requested",
            status=order.status,
            note=f"İade talebi oluşturuldu ({req.number})",
            payload={"return_id": req.id, "amount": str(refund_amount)},
        )

        # Bildirim e-postası (console backend — prod'da SMTP)
        try:
            from django.core.mail import send_mail
            from django.conf import settings as _settings

            recipient = order.user.email if order.user_id else order.guest_email
            if recipient:
                send_mail(
                    subject=f"İade talebiniz alındı · {req.number}",
                    message=(
                        f"Merhaba,\n\n{order.number} numaralı siparişinize ait iade talebinizi aldık.\n"
                        f"Talep numaranız: {req.number}\n"
                        f"İade tutarı: {refund_amount} TL\n\n"
                        "Durumu https://ekimcraft.com/hesap/iadeler adresinden takip edebilirsiniz."
                    ),
                    from_email=_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    fail_silently=True,
                )
        except Exception:
            pass

        return req


class AdminReturnUpdateSerializer(serializers.ModelSerializer):
    """Admin yönetimi — durum değişimi, not, tutar, kargo etiketi."""

    class Meta:
        model = ReturnRequest
        fields = (
            "status",
            "resolution",
            "admin_note",
            "refund_amount",
            "return_shipping_label",
            "tracking_number",
        )
        extra_kwargs = {k: {"required": False} for k in fields}


def _generate_return_number() -> str:
    """IAD-YYYYMMDD-XXXX formatında unique numara üret."""
    from django.utils.timezone import localdate

    date_part = localdate().strftime("%Y%m%d")
    while True:
        suffix = get_random_string(4, "0123456789")
        number = f"IAD-{date_part}-{suffix}"
        if not ReturnRequest.objects.filter(number=number).exists():
            return number
