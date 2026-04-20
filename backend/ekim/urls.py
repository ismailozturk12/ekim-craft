"""Ekim Craft API URL router"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


def health(_request):
    return JsonResponse({"status": "ok", "service": "ekim-api", "version": "1.0.0"})


api_v1 = [
    # Auth
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    # Domain apps (içleri Faz 2+ dolacak)
    path("accounts/", include("apps.accounts.urls")),
    path("catalog/", include("apps.catalog.urls")),
    path("orders/", include("apps.orders.urls")),
    path("studio/", include("apps.studio.urls")),
    path("payments/", include("apps.payments.urls")),
    path("shipping/", include("apps.shipping.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("core/", include("apps.core.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health, name="health"),
    path("api/v1/", include((api_v1, "api"), namespace="v1")),
    # OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
