from django.conf import settings as dj_settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimestampedModel

from .managers import UserManager


class User(AbstractUser):
    """Email-based user (username kaldırıldı)."""

    username = None
    email = models.EmailField(_("e-posta"), unique=True)
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    marketing_opt_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        verbose_name = _("Kullanıcı")
        verbose_name_plural = _("Kullanıcılar")
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.email


class Address(TimestampedModel):
    """Teslimat adresi."""

    user = models.ForeignKey(dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=50, help_text="Ev, İş, Tatil...")
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    line = models.CharField(max_length=255)
    district = models.CharField(max_length=80, blank=True)
    city = models.CharField(max_length=80)
    postal_code = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=2, default="TR")
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Adres")
        verbose_name_plural = _("Adresler")
        ordering = ("-is_default", "-created_at")

    def __str__(self) -> str:
        return f"{self.label} — {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(
                is_default=False
            )
        super().save(*args, **kwargs)


class PaymentMethod(TimestampedModel):
    """Kayıtlı kart (iyzico card token)."""

    user = models.ForeignKey(
        dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_methods"
    )
    iyzico_card_token = models.CharField(max_length=128, blank=True)
    card_alias = models.CharField(max_length=60, blank=True)
    last4 = models.CharField(max_length=4)
    brand = models.CharField(max_length=20, blank=True)
    exp_month = models.PositiveSmallIntegerField()
    exp_year = models.PositiveSmallIntegerField()
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Ödeme yöntemi")
        verbose_name_plural = _("Ödeme yöntemleri")

    def __str__(self) -> str:
        return f"{self.brand} •••• {self.last4}"


class NotificationPreference(TimestampedModel):
    """Kullanıcı başına bildirim tercihleri."""

    user = models.OneToOneField(
        dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_prefs"
    )
    email_order = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)
    sms_order = models.BooleanField(default=True)
    sms_marketing = models.BooleanField(default=False)
    push_order = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Bildirim tercihi")
        verbose_name_plural = _("Bildirim tercihleri")
