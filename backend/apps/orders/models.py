"""Sepet, sipariş, kupon modelleri."""

from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.catalog.models import Product, ProductVariant
from apps.core.models import TimestampedModel


class Coupon(TimestampedModel):
    class Type(models.TextChoices):
        PERCENT = "percent", _("Yüzde")
        FIXED = "fixed", _("Sabit tutar")
        FREE_SHIP = "free_ship", _("Ücretsiz kargo")

    code = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=120, blank=True)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.PERCENT)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Kupon")
        verbose_name_plural = _("Kuponlar")

    def __str__(self) -> str:
        return self.code


class Cart(TimestampedModel):
    """Kullanıcı başına aktif sepet (logged-in). Anonim için session_key."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="carts"
    )
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    applied_coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = _("Sepet")
        verbose_name_plural = _("Sepetler")

    def __str__(self) -> str:
        return f"Cart #{self.pk} ({self.user or self.session_key})"

    @property
    def subtotal(self) -> Decimal:
        return sum(
            (item.unit_price * item.qty for item in self.items.all()),
            Decimal("0.00"),
        )


class CartItem(TimestampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    qty = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    personalization = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = _("Sepet satırı")
        verbose_name_plural = _("Sepet satırları")
        ordering = ("-created_at",)


class Order(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", _("Beklemede")
        PAID = "paid", _("Ödendi")
        CONFIRMED = "confirmed", _("Onaylandı")
        IN_PRODUCTION = "in_production", _("Üretimde")
        SHIPPED = "shipped", _("Kargoya verildi")
        DELIVERED = "delivered", _("Teslim edildi")
        CANCELLED = "cancelled", _("İptal")
        REFUNDED = "refunded", _("İade edildi")

    class PaymentMethod(models.TextChoices):
        CARD = "card", _("Kredi kartı")
        TRANSFER = "transfer", _("Havale/EFT")
        COD = "cod", _("Kapıda ödeme")
        WALLET = "wallet", _("Cüzdan")

    class ShippingMethod(models.TextChoices):
        STANDARD = "standard", _("Standart")
        EXPRESS = "express", _("Hızlı")
        PICKUP = "pickup", _("Mağazadan teslim")

    number = models.CharField(max_length=20, unique=True, help_text="EK-28491")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    guest_email = models.EmailField(blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=20, default="pending")
    shipping_method = models.CharField(max_length=20, choices=ShippingMethod.choices)

    shipping_address = models.JSONField(default=dict)
    billing_address = models.JSONField(default=dict, blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TRY")

    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    tracking_number = models.CharField(max_length=60, blank=True)
    carrier = models.CharField(max_length=40, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        verbose_name = _("Sipariş")
        verbose_name_plural = _("Siparişler")
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self) -> str:
        return self.number


class OrderItem(TimestampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    name_snapshot = models.CharField(max_length=180, help_text="Satış anında ürün adı")
    size_snapshot = models.CharField(max_length=60, blank=True)
    color_snapshot = models.CharField(max_length=60, blank=True)
    qty = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    personalization = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = _("Sipariş satırı")
        verbose_name_plural = _("Sipariş satırları")

    @property
    def total(self):
        return self.unit_price * self.qty


class OrderEvent(TimestampedModel):
    """Sipariş zaman çizelgesi — 'Sipariş alındı', 'Kargoya verildi' vs."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=40)
    status = models.CharField(max_length=40, blank=True)
    note = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = _("Sipariş olayı")
        verbose_name_plural = _("Sipariş olayları")
        ordering = ("-created_at",)


class CouponUsage(TimestampedModel):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="usages")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="coupon_usages")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _("Kupon kullanımı")
        verbose_name_plural = _("Kupon kullanımları")


class ReturnRequest(TimestampedModel):
    """Müşteri iade/değişim talebi."""

    class Status(models.TextChoices):
        PENDING = "pending", _("Bekliyor")
        APPROVED = "approved", _("Onaylandı")
        REJECTED = "rejected", _("Reddedildi")
        RECEIVED = "received", _("Teslim alındı")
        REFUNDED = "refunded", _("İade edildi")
        CANCELLED = "cancelled", _("İptal")

    class Resolution(models.TextChoices):
        REFUND = "refund", _("Para iadesi")
        EXCHANGE = "exchange", _("Değişim")
        STORE_CREDIT = "store_credit", _("Mağaza kredisi")

    class Reason(models.TextChoices):
        WRONG_ITEM = "wrong_item", _("Yanlış ürün gönderildi")
        DAMAGED = "damaged", _("Hasarlı/kusurlu")
        NOT_AS_DESCRIBED = "not_as_described", _("Açıklamayla uyuşmuyor")
        SIZE = "size", _("Beden/ölçü uygun değil")
        CHANGED_MIND = "changed_mind", _("Vazgeçtim")
        OTHER = "other", _("Diğer")

    number = models.CharField(max_length=24, unique=True, db_index=True, help_text="IAD-20250421-0001")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="returns")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="returns"
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    resolution = models.CharField(max_length=20, choices=Resolution.choices, default=Resolution.REFUND)
    reason = models.CharField(max_length=30, choices=Reason.choices)
    customer_note = models.TextField(blank=True, help_text="Müşterinin açıklaması")
    admin_note = models.TextField(blank=True, help_text="Yalnızca yönetime görünür")

    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    return_shipping_label = models.URLField(blank=True, help_text="Kargo etiketi PDF URL'si")
    tracking_number = models.CharField(max_length=80, blank=True)

    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_returns",
    )

    class Meta:
        verbose_name = _("İade talebi")
        verbose_name_plural = _("İade talepleri")
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self) -> str:
        return self.number

    @property
    def can_cancel(self) -> bool:
        return self.status in {self.Status.PENDING, self.Status.APPROVED}


class ReturnRequestItem(TimestampedModel):
    request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name="items")
    order_item = models.ForeignKey(OrderItem, on_delete=models.PROTECT, related_name="return_items")
    qty = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Talep anındaki birim fiyat")

    class Meta:
        verbose_name = _("İade satırı")
        verbose_name_plural = _("İade satırları")

    def __str__(self) -> str:
        return f"{self.request.number} · {self.order_item.name_snapshot} × {self.qty}"

    @property
    def total(self):
        return self.unit_price * self.qty
