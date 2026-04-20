from django.contrib import admin

from .models import ApiKey, AuditLog, Setting, Webhook


@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ("key", "description", "updated_at")
    search_fields = ("key", "description")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "action", "entity", "entity_id")
    list_filter = ("action", "entity")
    search_fields = ("entity", "entity_id", "user__email")
    readonly_fields = ("created_at",)


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ("name", "prefix", "is_active", "last_used_at", "created_at")
    readonly_fields = ("key_hash", "prefix", "last_used_at")


@admin.register(Webhook)
class WebhookAdmin(admin.ModelAdmin):
    list_display = ("url", "is_active", "last_response_code", "last_triggered_at")
