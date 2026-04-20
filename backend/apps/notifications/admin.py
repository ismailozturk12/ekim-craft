from django.contrib import admin

from .models import MessageTemplate, Notification, OutboundMessage


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "user", "for_staff", "read_at", "created_at")
    list_filter = ("kind", "for_staff")
    search_fields = ("title", "body")


@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ("event", "channel", "is_active", "updated_at")
    list_filter = ("channel", "is_active")


@admin.register(OutboundMessage)
class OutboundMessageAdmin(admin.ModelAdmin):
    list_display = ("channel", "to_address", "status", "created_at")
    list_filter = ("channel", "status")
