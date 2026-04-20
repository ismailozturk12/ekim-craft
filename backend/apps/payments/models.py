"""Ödeme referansları — iyzico ile entegre edilecek."""

from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimestampedModel
from apps.orders.models import Order


class PaymentIntent(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", _("Beklemede")
        AUTHORIZED = "authorized", _("Yetkilendi")
        CAPTURED = "captured", _("Tahsil edildi")
        FAILED = "failed", _("Başarısız")
        CANCELED = "canceled", _("İptal")
        REFUNDED = "refunded", _("İade")

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payment_intents")
    provider = models.CharField(max_length=40, default="iyzico")
    provider_reference = models.CharField(max_length=120, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TRY")
    installment = models.PositiveSmallIntegerField(default=1)
    raw_response = models.JSONField(default=dict, blank=True)
    error_code = models.CharField(max_length=60, blank=True)
    error_message = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = _("Ödeme girişimi")
        verbose_name_plural = _("Ödeme girişimleri")
        ordering = ("-created_at",)


class Refund(TimestampedModel):
    payment = models.ForeignKey(PaymentIntent, on_delete=models.CASCADE, related_name="refunds")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True)
    provider_reference = models.CharField(max_length=120, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = _("İade")
        verbose_name_plural = _("İadeler")
