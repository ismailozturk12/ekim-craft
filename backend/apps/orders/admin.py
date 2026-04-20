from django.contrib import admin

from .models import Cart, CartItem, Coupon, CouponUsage, Order, OrderEvent, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name_snapshot", "unit_price")


class OrderEventInline(admin.TabularInline):
    model = OrderEvent
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("number", "user", "status", "payment_method", "total", "created_at")
    list_filter = ("status", "payment_method", "shipping_method")
    search_fields = ("number", "user__email", "tracking_number")
    inlines = [OrderItemInline, OrderEventInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "value", "usage_limit", "used_count", "expires_at", "is_active")
    list_filter = ("type", "is_active")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_key", "applied_coupon", "updated_at")
    inlines = [CartItemInline]


admin.site.register(CouponUsage)
