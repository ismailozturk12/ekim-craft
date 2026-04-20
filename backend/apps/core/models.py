"""Çekirdek/paylaşılan modeller: timestamp mixin, audit log, settings."""

from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Setting(TimestampedModel):
    """Singleton-style key/value store — mağaza bilgileri, genel tercihler."""

    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(default=dict, blank=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = _("Ayar")
        verbose_name_plural = _("Ayarlar")

    def __str__(self) -> str:
        return self.key


class AuditLog(TimestampedModel):
    """Admin işlemleri için denetim kaydı."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=50)  # create|update|delete|login|...
    entity = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=64, blank=True)
    diff = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = _("Denetim kaydı")
        verbose_name_plural = _("Denetim kayıtları")
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["entity", "entity_id"])]

    def __str__(self) -> str:
        return f"{self.action} {self.entity} ({self.entity_id})"


class ApiKey(TimestampedModel):
    name = models.CharField(max_length=100)
    key_hash = models.CharField(max_length=128, unique=True)
    prefix = models.CharField(max_length=12)
    scopes = models.JSONField(default=list, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = _("API anahtarı")
        verbose_name_plural = _("API anahtarları")

    def __str__(self) -> str:
        return f"{self.name} ({self.prefix})"


class Webhook(TimestampedModel):
    url = models.URLField()
    events = models.JSONField(default=list, blank=True)
    secret = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    last_response_code = models.IntegerField(null=True, blank=True)
    last_triggered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Webhook")
        verbose_name_plural = _("Webhook'lar")

    def __str__(self) -> str:
        return self.url


class NewsletterSubscriber(TimestampedModel):
    email = models.EmailField(unique=True)
    source = models.CharField(max_length=60, default="footer")
    confirmed_at = models.DateTimeField(null=True, blank=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("Bülten aboneliği")
        verbose_name_plural = _("Bülten abonelikleri")
        ordering = ("-created_at",)


class ContactMessage(TimestampedModel):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=80, blank=True)
    body = models.TextField()
    is_handled = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("İletişim mesajı")
        verbose_name_plural = _("İletişim mesajları")
        ordering = ("-created_at",)
