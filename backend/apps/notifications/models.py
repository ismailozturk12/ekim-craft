"""Bildirim sistemi — kullanıcı mesajı + admin activity feed + şablonlar."""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimestampedModel


class Notification(TimestampedModel):
    """Kullanıcıya veya admin'e yönelik bildirim."""

    class Kind(models.TextChoices):
        ORDER = "order", _("Sipariş")
        STOCK = "stock", _("Stok")
        REVIEW = "review", _("Yorum")
        RETURN = "return", _("İade")
        DELIVERY = "delivery", _("Teslimat")
        CUSTOMER = "customer", _("Müşteri")
        PAYMENT = "payment", _("Ödeme")
        SYSTEM = "system", _("Sistem")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    for_staff = models.BooleanField(default=False, db_index=True)
    kind = models.CharField(max_length=20, choices=Kind.choices)
    title = models.CharField(max_length=200)
    body = models.CharField(max_length=500, blank=True)
    link = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Bildirim")
        verbose_name_plural = _("Bildirimler")
        ordering = ("-created_at",)


class MessageTemplate(TimestampedModel):
    """E-posta / SMS / WhatsApp şablonları."""

    class Channel(models.TextChoices):
        EMAIL = "email", _("E-posta")
        SMS = "sms", _("SMS")
        WHATSAPP = "whatsapp", _("WhatsApp")
        PUSH = "push", _("Push")

    event = models.CharField(max_length=60)  # order.placed, order.shipped, ...
    channel = models.CharField(max_length=16, choices=Channel.choices)
    subject = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Mesaj şablonu")
        verbose_name_plural = _("Mesaj şablonları")
        constraints = [
            models.UniqueConstraint(fields=["event", "channel"], name="unique_event_channel"),
        ]

    def __str__(self) -> str:
        return f"{self.event} [{self.channel}]"


class OutboundMessage(TimestampedModel):
    """Gönderilen mesajların logu."""

    class Status(models.TextChoices):
        QUEUED = "queued", _("Kuyruğa alındı")
        SENT = "sent", _("Gönderildi")
        DELIVERED = "delivered", _("Teslim")
        FAILED = "failed", _("Başarısız")

    channel = models.CharField(max_length=16)
    to_address = models.CharField(max_length=200)
    template = models.ForeignKey(MessageTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    context = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.QUEUED)
    provider_reference = models.CharField(max_length=120, blank=True)
    error = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = _("Giden mesaj")
        verbose_name_plural = _("Giden mesajlar")
        ordering = ("-created_at",)
