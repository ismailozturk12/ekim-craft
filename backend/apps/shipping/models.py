"""Kargo sağlayıcıları + gönderi takibi."""

from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimestampedModel
from apps.orders.models import Order


class ShippingProvider(TimestampedModel):
    """Aras / MNG / Yurtiçi / PTT / UPS."""

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    is_active = models.BooleanField(default=True)
    api_key_enc = models.CharField(max_length=255, blank=True)
    api_username = models.CharField(max_length=100, blank=True)
    config = models.JSONField(default=dict, blank=True)
    logo_url = models.URLField(blank=True)

    class Meta:
        verbose_name = _("Kargo sağlayıcı")
        verbose_name_plural = _("Kargo sağlayıcılar")

    def __str__(self) -> str:
        return self.name


class Shipment(TimestampedModel):
    class Status(models.TextChoices):
        CREATED = "created", _("Oluşturuldu")
        LABELED = "labeled", _("Etiket basıldı")
        PICKED_UP = "picked_up", _("Toplandı")
        IN_TRANSIT = "in_transit", _("Dağıtımda")
        DELIVERED = "delivered", _("Teslim")
        RETURNED = "returned", _("İade")
        FAILED = "failed", _("Başarısız")

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="shipments")
    provider = models.ForeignKey(ShippingProvider, on_delete=models.PROTECT)
    tracking_number = models.CharField(max_length=60, unique=True)
    label_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    estimated_delivery = models.DateField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    raw_events = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = _("Gönderi")
        verbose_name_plural = _("Gönderiler")
        ordering = ("-created_at",)


class ReturnRequest(TimestampedModel):
    class Status(models.TextChoices):
        REQUESTED = "requested", _("Talep edildi")
        APPROVED = "approved", _("Onaylandı")
        RECEIVED = "received", _("Alındı")
        REFUNDED = "refunded", _("İade edildi")
        REJECTED = "rejected", _("Reddedildi")

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="return_requests")
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = _("İade talebi")
        verbose_name_plural = _("İade talepleri")
