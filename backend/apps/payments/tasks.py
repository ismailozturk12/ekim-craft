"""Celery tasks — ödeme."""

from celery import shared_task

from apps.orders.models import Order

from .services import get_gateway


@shared_task
def checkout_order(order_id: int) -> int:
    order = Order.objects.get(pk=order_id)
    intent = get_gateway().checkout(order)
    return intent.pk
