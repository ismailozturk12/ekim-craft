"""Tasarım Stüdyosu: kişiselleştirme asset'leri + taslaklar."""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.catalog.models import Product
from apps.core.models import TimestampedModel


class PersonalizationAsset(TimestampedModel):
    """Kullanıcının yüklediği fotoğraf / metin / custom tasarım."""

    class Kind(models.TextChoices):
        IMAGE = "image", _("Görsel")
        TEXT = "text", _("Metin")
        SVG = "svg", _("Vektör")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="personalization_assets",
    )
    kind = models.CharField(max_length=16, choices=Kind.choices)
    file = models.FileField(upload_to="personalization/%Y/%m/", blank=True)
    text_content = models.CharField(max_length=200, blank=True)
    mime_type = models.CharField(max_length=80, blank=True)
    byte_size = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = _("Kişiselleştirme asset'i")
        verbose_name_plural = _("Kişiselleştirme asset'leri")


class DesignDraft(TimestampedModel):
    """Stüdyo taslağı — kaydet/sonra devam et."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="design_drafts"
    )
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=120, blank=True)
    layers = models.JSONField(default=list, blank=True, help_text="Katman listesi (type, x, y, rotation, src...)")
    canvas_size = models.JSONField(default=dict, blank=True)
    preview_url = models.URLField(blank=True)

    class Meta:
        verbose_name = _("Tasarım taslağı")
        verbose_name_plural = _("Tasarım taslakları")
        ordering = ("-updated_at",)

    def __str__(self) -> str:
        return self.name or f"Taslak #{self.pk}"
