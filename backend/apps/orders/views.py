from decimal import Decimal

from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle


class _CouponValidateThrottle(AnonRateThrottle):
    scope = "coupon_validate"

from .models import Coupon, Order, OrderEvent, ReturnRequest
from .serializers import (
    AdminOrderUpdateSerializer,
    AdminReturnUpdateSerializer,
    CheckoutSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    ReturnRequestCreateSerializer,
    ReturnRequestDetailSerializer,
    ReturnRequestListSerializer,
)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([_CouponValidateThrottle])
def validate_coupon(request):
    """Kupon kodunu doğrular ve indirim tutarını hesaplar."""
    code = (request.data.get("code") or "").strip().upper()
    subtotal = Decimal(str(request.data.get("subtotal") or "0"))
    if not code:
        return Response({"valid": False, "detail": "Kod gerekli"}, status=400)

    try:
        coupon = Coupon.objects.get(code__iexact=code, is_active=True)
    except Coupon.DoesNotExist:
        return Response({"valid": False, "detail": "Geçersiz veya pasif kod"}, status=404)

    now = timezone.now()
    if coupon.starts_at and coupon.starts_at > now:
        return Response({"valid": False, "detail": "Kod henüz aktif değil"}, status=400)
    if coupon.expires_at and coupon.expires_at < now:
        return Response({"valid": False, "detail": "Kodun süresi dolmuş"}, status=400)
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return Response({"valid": False, "detail": "Kod limiti doldu"}, status=400)
    if coupon.min_order and subtotal < coupon.min_order:
        return Response(
            {
                "valid": False,
                "detail": f"En az {coupon.min_order} TL sipariş gerekir",
                "min_order": str(coupon.min_order),
            },
            status=400,
        )

    discount = Decimal("0.00")
    free_shipping = False
    if coupon.type == Coupon.Type.PERCENT:
        discount = (subtotal * coupon.value / Decimal("100")).quantize(Decimal("0.01"))
    elif coupon.type == Coupon.Type.FIXED:
        discount = min(subtotal, coupon.value).quantize(Decimal("0.01"))
    elif coupon.type == Coupon.Type.FREE_SHIP:
        free_shipping = True

    return Response(
        {
            "valid": True,
            "code": coupon.code,
            "name": coupon.name or coupon.code,
            "type": coupon.type,
            "value": str(coupon.value),
            "discount": str(discount),
            "free_shipping": free_shipping,
        }
    )


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Müşteri ve admin sipariş endpoint'i. Admin tüm siparişleri görür + günceller."""

    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "number"
    lookup_value_regex = r"EK-\d+"

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items", "events").order_by("-created_at")
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return CheckoutSerializer
        if self.action in ("update", "partial_update"):
            return AdminOrderUpdateSerializer
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderListSerializer

    def get_permissions(self):
        # Update sadece staff
        if self.action in ("update", "partial_update"):
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        order = ser.save()
        return Response(
            OrderDetailSerializer(order, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        order = self.get_object()
        prev_status = order.status
        ser = self.get_serializer(order, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        order = ser.save()

        # Durum değişti → timeline event'i ekle
        if order.status != prev_status:
            OrderEvent.objects.create(
                order=order,
                event_type="status_change",
                status=order.status,
                note=f"{prev_status} → {order.status}",
                created_by=request.user,
            )
        # Prefetch cache'i yenile
        order = Order.objects.prefetch_related("items", "events").get(pk=order.pk)
        return Response(OrderDetailSerializer(order, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, number=None):
        order = self.get_object()
        # Staff her zaman iptal edebilir
        # Normal kullanıcı sadece kendi siparişini ve erken aşamada iptal edebilir
        if not request.user.is_staff:
            if order.user_id != request.user.id:
                return Response({"detail": "Yetkiniz yok"}, status=403)
            if order.status not in (Order.Status.PENDING, Order.Status.PAID, Order.Status.CONFIRMED):
                return Response(
                    {"detail": "Bu aşamadaki siparişi iptal edemezsin. Destek ile iletişime geç."},
                    status=400,
                )

        if order.status in (Order.Status.DELIVERED, Order.Status.CANCELLED, Order.Status.REFUNDED):
            return Response(
                {"detail": "Bu sipariş iptal edilebilir durumda değil."}, status=400
            )
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(
            order=order,
            event_type="cancelled",
            status=order.status,
            note=request.data.get("reason", "Müşteri iptali" if not request.user.is_staff else "Admin iptali"),
            created_by=request.user,
        )
        return Response(OrderDetailSerializer(order, context={"request": request}).data)


class ReturnRequestViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """İade talep endpoint'i. Müşteri kendi taleplerini görür; staff hepsini."""

    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "number"
    lookup_value_regex = r"IAD-[\d\-]+"

    def get_queryset(self):
        qs = (
            ReturnRequest.objects.select_related("order", "user", "processed_by")
            .prefetch_related("items", "items__order_item")
            .order_by("-created_at")
        )
        if self.request.user.is_staff:
            status_filter = self.request.query_params.get("status")
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return ReturnRequestCreateSerializer
        if self.action in ("update", "partial_update"):
            return AdminReturnUpdateSerializer
        if self.action == "list":
            return ReturnRequestListSerializer
        return ReturnRequestDetailSerializer

    def get_permissions(self):
        if self.action in ("update", "partial_update"):
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        req = ser.save()
        return Response(
            ReturnRequestDetailSerializer(req, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        req = self.get_object()
        prev_status = req.status
        ser = self.get_serializer(req, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        req = ser.save()

        if req.status != prev_status:
            req.processed_at = timezone.now()
            req.processed_by = request.user
            req.save(update_fields=["processed_at", "processed_by"])

            OrderEvent.objects.create(
                order=req.order,
                event_type="return_status",
                status=req.status,
                note=f"İade {req.number}: {prev_status} → {req.status}",
                created_by=request.user,
                payload={"return_id": req.id},
            )

            # REFUNDED'a geçerse siparişi de REFUNDED yap (full iade ise)
            if req.status == ReturnRequest.Status.REFUNDED and req.refund_amount >= req.order.total:
                req.order.status = Order.Status.REFUNDED
                req.order.save(update_fields=["status", "updated_at"])

            # Müşteriye bilgi e-postası
            try:
                from django.conf import settings as _settings
                from django.core.mail import send_mail

                recipient = (
                    req.order.user.email if req.order.user_id else req.order.guest_email
                )
                if recipient:
                    send_mail(
                        subject=f"İade talebinizin durumu · {req.number}",
                        message=(
                            f"Merhaba,\n\n{req.number} numaralı iade talebinizin durumu güncellendi.\n"
                            f"Yeni durum: {req.get_status_display()}\n"
                            f"{('Admin notu: ' + req.admin_note) if req.admin_note else ''}\n\n"
                            "Detaylar: https://ekimcraft.com/hesap/iadeler"
                        ),
                        from_email=_settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[recipient],
                        fail_silently=True,
                    )
            except Exception:
                pass

        return Response(ReturnRequestDetailSerializer(req, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, number=None):
        req = self.get_object()
        if not request.user.is_staff and req.user_id != request.user.id:
            return Response({"detail": "Yetkiniz yok"}, status=403)
        if not req.can_cancel:
            return Response({"detail": "Bu iade talebi iptal edilebilir durumda değil."}, status=400)
        req.status = ReturnRequest.Status.CANCELLED
        req.processed_at = timezone.now()
        req.save(update_fields=["status", "processed_at", "updated_at"])
        OrderEvent.objects.create(
            order=req.order,
            event_type="return_cancelled",
            status=req.order.status,
            note=f"İade iptal edildi ({req.number})",
            created_by=request.user,
        )
        return Response(ReturnRequestDetailSerializer(req, context={"request": request}).data)
