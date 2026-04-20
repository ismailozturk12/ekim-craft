from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.core.models import Setting

from .models import Address, PaymentMethod
from .serializers import (
    AddressSerializer,
    EkimTokenSerializer,
    PaymentMethodSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class EkimTokenView(TokenObtainPairView):
    serializer_class = EkimTokenSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_me(request):
    ser = UserSerializer(request.user, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(ser.data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """Kayıtlı kartlar — şu an mock, Faz 11'de iyzico tokenization."""

    serializer_class = PaymentMethodSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================================
# Password change / reset
# ============================================================
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    current = request.data.get("current_password", "")
    new = request.data.get("new_password", "")
    if not request.user.check_password(current):
        return Response({"current_password": "Mevcut şifre yanlış"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(new, user=request.user)
    except ValidationError as e:
        return Response({"new_password": e.messages}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(new)
    request.user.save()
    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Email al → 32 karakterli token üret → Setting key 'pwdreset:<token>' olarak sakla (1 saat).
    Email gönderimi şu an log'a düşer; Faz 11'de Resend ile gerçek mail."""
    email = (request.data.get("email") or "").strip().lower()
    if not email:
        return Response({"email": "E-posta zorunlu"}, status=400)

    user = User.objects.filter(email__iexact=email).first()
    # Güvenlik: kullanıcı olmasa da aynı cevabı dön (enumeration önle)
    if user:
        token = get_random_string(48)
        Setting.objects.update_or_create(
            key=f"pwdreset:{token}",
            defaults={
                "value": {
                    "user_id": user.id,
                    "email": user.email,
                    "expires_at": (timezone.now() + timedelta(hours=1)).isoformat(),
                },
                "description": "Şifre sıfırlama token'ı",
            },
        )
        # Dev'de console'a yaz, prod'da Resend
        try:
            from django.conf import settings as dj_settings

            site_url = getattr(dj_settings, "SITE_URL", "").rstrip("/") or "https://ekimcraft.com"
            reset_url = f"{site_url}/sifre-sifirla/{token}"
            send_mail(
                "Ekim Craft — Şifreni sıfırla",
                f"Aşağıdaki bağlantı ile şifreni sıfırla:\n\n{reset_url}\n\n1 saat içinde kullanılmazsa geçersiz olur.",
                None,
                [user.email],
                fail_silently=True,
            )
        except Exception:
            pass

    return Response({"ok": True, "detail": "E-posta adresin kayıtlıysa sıfırlama bağlantısı gönderildi."})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    token = request.data.get("token", "")
    new = request.data.get("new_password", "")
    if not token or not new:
        return Response({"detail": "Token ve yeni şifre zorunlu"}, status=400)

    setting = Setting.objects.filter(key=f"pwdreset:{token}").first()
    if not setting:
        return Response({"token": "Geçersiz veya kullanılmış token"}, status=400)

    expires_at = timezone.datetime.fromisoformat(setting.value.get("expires_at"))
    if timezone.now() > expires_at:
        setting.delete()
        return Response({"token": "Token süresi doldu"}, status=400)

    try:
        user = User.objects.get(pk=setting.value["user_id"])
    except User.DoesNotExist:
        setting.delete()
        return Response({"token": "Kullanıcı bulunamadı"}, status=400)

    try:
        validate_password(new, user=user)
    except ValidationError as e:
        return Response({"new_password": e.messages}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new)
    user.save()
    setting.delete()  # Token tek kullanımlık
    return Response({"ok": True})
