from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-created_at",)
    list_display = ("email", "first_name", "last_name", "is_staff", "created_at")
    search_fields = ("email", "first_name", "last_name", "phone")
    readonly_fields = ("last_login", "date_joined", "created_at")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Kişisel bilgiler"), {"fields": ("first_name", "last_name", "phone", "birth_date")}),
        (_("Tercihler"), {"fields": ("marketing_opt_in",)}),
        (_("İzinler"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Önemli tarihler"), {"fields": ("last_login", "date_joined", "created_at")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
