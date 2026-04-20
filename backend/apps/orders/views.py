from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order, OrderEvent
from .serializers import (
    AdminOrderUpdateSerializer,
    CheckoutSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
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
