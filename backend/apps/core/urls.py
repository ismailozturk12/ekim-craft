from django.urls import path
from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminCouponViewSet,
    AdminSettingViewSet,
    admin_customers,
    admin_stock,
    admin_stock_update,
    contact_submit,
    dashboard_stats,
    newsletter_subscribe,
    notifications_list,
    notifications_mark_all_read,
    report_download,
)

router = DefaultRouter()
router.register(r"admin/coupons", AdminCouponViewSet, basename="admin-coupon")
router.register(r"admin/settings", AdminSettingViewSet, basename="admin-setting")

urlpatterns = [
    path("admin/dashboard/", dashboard_stats, name="admin-dashboard"),
    path("admin/customers/", admin_customers, name="admin-customers"),
    path("admin/stock/", admin_stock, name="admin-stock"),
    path("admin/stock/<int:variant_id>/", admin_stock_update, name="admin-stock-update"),
    path("admin/reports/<str:report_id>/", report_download, name="admin-report"),
    path("notifications/", notifications_list, name="notifications-list"),
    path("notifications/mark-all-read/", notifications_mark_all_read, name="notifications-read-all"),
    path("newsletter/subscribe/", newsletter_subscribe, name="newsletter-subscribe"),
    path("contact/", contact_submit, name="contact-submit"),
]

urlpatterns += router.urls
