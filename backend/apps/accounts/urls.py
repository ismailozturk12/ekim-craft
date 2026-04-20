from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    PaymentMethodViewSet,
    RegisterView,
    change_password,
    me,
    password_reset_confirm,
    password_reset_request,
    update_me,
)

router = DefaultRouter()
router.register(r"addresses", AddressViewSet, basename="address")
router.register(r"cards", PaymentMethodViewSet, basename="card")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", me, name="me"),
    path("me/update/", update_me, name="update-me"),
    path("me/password/", change_password, name="change-password"),
    path("password-reset/", password_reset_request, name="password-reset"),
    path("password-reset/confirm/", password_reset_confirm, name="password-reset-confirm"),
]

urlpatterns += router.urls
