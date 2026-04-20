"""Admin paneli için agregat endpoint'ler (dashboard, customers, stock, notifications, reports)."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q, Sum
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.catalog.models import Product, ProductVariant
from apps.orders.models import Coupon, Order
from apps.notifications.models import Notification

User = get_user_model()


# =======================================================================
# Dashboard / stats
# =======================================================================
@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def dashboard_stats(request):
    now = timezone.now()
    today = now.date()

    # Bugün
    today_orders = Order.objects.filter(created_at__date=today)
    today_revenue = today_orders.aggregate(s=Sum("total"))["s"] or Decimal("0.00")
    today_count = today_orders.count()

    yesterday = today - timedelta(days=1)
    yday_revenue = Order.objects.filter(created_at__date=yesterday).aggregate(s=Sum("total"))["s"] or Decimal("0.00")
    delta = 0.0
    if yday_revenue > 0:
        delta = float((today_revenue - yday_revenue) / yday_revenue * 100)

    # 30 gün
    since_30d = now - timedelta(days=30)
    rev_30d = Order.objects.filter(created_at__gte=since_30d).aggregate(s=Sum("total"))["s"] or Decimal("0.00")

    # 30 gün önceki 30 gün (delta için)
    since_60d = now - timedelta(days=60)
    rev_prev_30d = (
        Order.objects.filter(created_at__gte=since_60d, created_at__lt=since_30d).aggregate(s=Sum("total"))[
            "s"
        ]
        or Decimal("0.00")
    )
    delta_30d = 0.0
    if rev_prev_30d > 0:
        delta_30d = float((rev_30d - rev_prev_30d) / rev_prev_30d * 100)

    # 30 günlük günlük ciro dizisi (sparkline için)
    daily = []
    for i in range(29, -1, -1):
        day = (now - timedelta(days=i)).date()
        total = (
            Order.objects.filter(created_at__date=day).aggregate(s=Sum("total"))["s"] or Decimal("0.00")
        )
        daily.append(float(total))

    # Kategori kırılımı (30g)
    category_breakdown = []
    from django.db.models import DecimalField, ExpressionWrapper

    for row in (
        Order.objects.filter(created_at__gte=since_30d)
        .values("items__product__category__name", "items__product__category__slug")
        .annotate(
            revenue=Sum(
                ExpressionWrapper(F("items__unit_price") * F("items__qty"), output_field=DecimalField(max_digits=12, decimal_places=2))
            ),
            orders=Count("id", distinct=True),
        )
        .order_by("-revenue")
    ):
        if not row["items__product__category__name"]:
            continue
        category_breakdown.append(
            {
                "name": row["items__product__category__name"],
                "slug": row["items__product__category__slug"],
                "revenue": float(row["revenue"] or 0),
                "orders": row["orders"],
            }
        )

    # Stok uyarıları (variant stock < 5)
    stock_alerts = []
    for v in ProductVariant.objects.filter(is_active=True, stock__lte=5).select_related("product")[:10]:
        stock_alerts.append(
            {
                "product_name": v.product.name,
                "slug": v.product.slug,
                "variant": f"{v.size_label} / {v.color_name}".strip(" /"),
                "stock": v.stock,
            }
        )

    # Bekleyen kişiye özel (sipariş var ama kişiselleştirme detayı eksik)
    pending_custom = Order.objects.filter(
        status__in=["pending", "paid", "confirmed"], items__personalization__has_key="text"
    ).distinct().count()

    # Son 6 sipariş
    recent = []
    for o in Order.objects.select_related("user").order_by("-created_at")[:6]:
        recent.append(
            {
                "number": o.number,
                "customer": (o.user.get_full_name() or o.user.email) if o.user else "Misafir",
                "total": float(o.total),
                "status": o.status,
                "created_at": o.created_at.isoformat(),
            }
        )

    return Response(
        {
            "today": {"revenue": float(today_revenue), "orders": today_count, "delta_vs_yesterday": delta},
            "pending_custom": pending_custom,
            "last_30d": {
                "revenue": float(rev_30d),
                "delta_vs_prev_30d": delta_30d,
                "daily": daily,
            },
            "category_breakdown": category_breakdown,
            "stock_alerts": stock_alerts,
            "recent_orders": recent,
        }
    )


# =======================================================================
# Customers (admin list)
# =======================================================================
@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def admin_customers(request):
    since_180d = timezone.now() - timedelta(days=180)
    qs = (
        User.objects.annotate(
            orders_count=Count("orders", filter=Q(orders__created_at__gte=since_180d)),
            total_spent=Sum("orders__total", filter=Q(orders__created_at__gte=since_180d)),
        )
        .filter(is_staff=False)
        .order_by("-total_spent", "-created_at")[:100]
    )

    out = []
    for u in qs:
        out.append(
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.email,
                "email": u.email,
                "phone": u.phone,
                "orders_count": u.orders_count or 0,
                "total_spent": float(u.total_spent or 0),
                "is_vip": (u.total_spent or 0) >= 3000,
                "created_at": u.created_at.isoformat(),
            }
        )
    return Response({"count": len(out), "results": out})


# =======================================================================
# Stock (variant level)
# =======================================================================
@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def admin_stock(request):
    since_30d = timezone.now() - timedelta(days=30)
    variants = (
        ProductVariant.objects.select_related("product", "product__category")
        .filter(is_active=True)
        .order_by("stock", "product__name")
    )

    out = []
    for v in variants:
        # 30g satış
        sold = (
            Order.objects.filter(
                items__variant=v,
                created_at__gte=since_30d,
                status__in=["paid", "confirmed", "in_production", "shipped", "delivered"],
            ).aggregate(s=Sum("items__qty"))["s"]
            or 0
        )
        days_left = None
        if sold > 0:
            days_left = int(v.stock / (sold / 30))
        if v.stock <= 5:
            status_key = "danger"
        elif v.stock <= 20:
            status_key = "warn"
        else:
            status_key = "success"

        out.append(
            {
                "id": v.id,
                "product_id": v.product.id,
                "product_name": v.product.name,
                "category": v.product.category.name,
                "size_label": v.size_label,
                "color_name": v.color_name,
                "sku": v.sku,
                "stock": v.stock,
                "sold_30d": sold,
                "days_left": days_left,
                "status": status_key,
            }
        )
    return Response({"count": len(out), "results": out})


@api_view(["PATCH"])
@permission_classes([permissions.IsAdminUser])
def admin_stock_update(request, variant_id: int):
    try:
        variant = ProductVariant.objects.get(pk=variant_id)
    except ProductVariant.DoesNotExist:
        return Response({"detail": "Varyant bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
    new_stock = request.data.get("stock")
    if new_stock is None or int(new_stock) < 0:
        return Response({"stock": "Geçersiz değer"}, status=status.HTTP_400_BAD_REQUEST)
    variant.stock = int(new_stock)
    variant.save(update_fields=["stock", "updated_at"])
    return Response({"id": variant.id, "stock": variant.stock})


# =======================================================================
# Coupons (CRUD)
# =======================================================================
from rest_framework import serializers as drf_serializers


class CouponSerializer(drf_serializers.ModelSerializer):
    usage_percent = drf_serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = (
            "id",
            "code",
            "name",
            "type",
            "value",
            "min_order",
            "usage_limit",
            "used_count",
            "starts_at",
            "expires_at",
            "is_active",
            "usage_percent",
            "created_at",
        )
        read_only_fields = ("used_count", "created_at", "usage_percent")

    def get_usage_percent(self, obj):
        if not obj.usage_limit:
            return None
        return round(obj.used_count / obj.usage_limit * 100, 1)


class AdminCouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by("-created_at")
    serializer_class = CouponSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = "code"
    lookup_value_regex = r"[\w\-]+"


# =======================================================================
# Notifications (kullanıcı/staff)
# =======================================================================
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def notifications_list(request):
    qs = Notification.objects.filter(
        (Q(user=request.user) | Q(for_staff=True)) if request.user.is_staff else Q(user=request.user)
    ).order_by("-created_at")[:50]

    out = []
    for n in qs:
        out.append(
            {
                "id": n.id,
                "kind": n.kind,
                "title": n.title,
                "body": n.body,
                "link": n.link,
                "read": n.read_at is not None,
                "created_at": n.created_at.isoformat(),
            }
        )
    return Response({"count": len(out), "results": out, "unread": sum(1 for n in qs if n.read_at is None)})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def notifications_mark_all_read(request):
    now = timezone.now()
    query = Q(user=request.user)
    if request.user.is_staff:
        query |= Q(for_staff=True)
    count = Notification.objects.filter(query, read_at__isnull=True).update(read_at=now)
    return Response({"updated": count})


# =======================================================================
# Settings (key/value)
# =======================================================================
from apps.core.models import ContactMessage, NewsletterSubscriber, Setting


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def newsletter_subscribe(request):
    email = (request.data.get("email") or "").strip().lower()
    if not email or "@" not in email:
        return Response({"email": "Geçerli e-posta gir"}, status=status.HTTP_400_BAD_REQUEST)
    NewsletterSubscriber.objects.get_or_create(
        email=email, defaults={"source": request.data.get("source", "footer")}
    )
    return Response({"ok": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def contact_submit(request):
    name = (request.data.get("name") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    body = (request.data.get("body") or "").strip()
    if not name or not email or len(body) < 10:
        return Response(
            {"detail": "Ad, e-posta ve mesaj (min 10 karakter) zorunlu"}, status=status.HTTP_400_BAD_REQUEST
        )
    ContactMessage.objects.create(
        name=name, email=email, subject=(request.data.get("subject") or "")[:80], body=body
    )
    return Response({"ok": True}, status=status.HTTP_201_CREATED)


class SettingSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ("key", "value", "description", "updated_at")
        read_only_fields = ("updated_at",)


class AdminSettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all().order_by("key")
    serializer_class = SettingSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = "key"
    lookup_value_regex = r"[\w\.\-]+"


# =======================================================================
# Reports (mock download stub)
# =======================================================================
@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def report_download(request, report_id: str):
    """Şimdilik mock CSV/PDF — Faz 11'de Celery task ile tam rapor.
    DRF `format` query param ile çakışmasın diye `ext` kullanıyoruz."""
    fmt = request.query_params.get("ext", "csv")
    from django.http import HttpResponse

    content_type = "application/pdf" if fmt == "pdf" else "text/csv"
    filename = f"ekim-{report_id}-{timezone.now().date()}.{fmt}"

    if fmt == "csv":
        body = f"# Ekim Craft — {report_id} raporu\n# Tarih: {timezone.now().date()}\n\nÖrnek,Veri\n1,540\n2,220\n"
    else:
        body = f"Ekim Craft {report_id.upper()} raporu — {timezone.now().date()}\n(gerçek PDF üretimi Faz 11)\n"

    response = HttpResponse(body, content_type=content_type)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
