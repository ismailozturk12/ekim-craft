from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import UserManager


class User(AbstractUser):
    """
    Email-based user (username kaldırıldı).
    Faz 2'de Address, payment methods, notification prefs eklenecek.
    """

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
