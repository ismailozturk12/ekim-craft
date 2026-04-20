"""
iyzico ödeme adaptörü — Faz 11 iskeleti.

Prod'da kullanım:
    pip install iyzipay
    IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL env'den doldurulur.

Mimari:
    PaymentProvider.checkout(order, card_token=None) -> PaymentIntent
    PaymentProvider.capture(intent) -> PaymentIntent
    PaymentProvider.refund(intent, amount) -> Refund
    PaymentProvider.webhook(payload) -> durum güncelle
"""

from __future__ import annotations

from decimal import Decimal
from typing import Protocol

from django.conf import settings

from apps.orders.models import Order

from .models import PaymentIntent


class PaymentGateway(Protocol):
    def checkout(self, order: Order, **kwargs) -> PaymentIntent: ...
    def capture(self, intent: PaymentIntent) -> PaymentIntent: ...
    def refund(self, intent: PaymentIntent, amount: Decimal) -> dict: ...


class IyzicoGateway:
    """
    iyzico implementation. Şu an stub — Faz 11'de iyzipay SDK ile doldurulacak.
    """

    def __init__(self) -> None:
        self.api_key = getattr(settings, "IYZICO_API_KEY", None)
        self.secret_key = getattr(settings, "IYZICO_SECRET_KEY", None)
        self.base_url = getattr(settings, "IYZICO_BASE_URL", "https://sandbox-api.iyzipay.com")

    def checkout(self, order: Order, **kwargs) -> PaymentIntent:
        # Gerçek iyzipay.CheckoutFormInitialize.create(...)
        intent = PaymentIntent.objects.create(
            order=order,
            provider="iyzico",
            status=PaymentIntent.Status.PENDING,
            amount=order.total,
            currency=order.currency,
            installment=kwargs.get("installment", 1),
            provider_reference=f"iyz_stub_{order.number}",
            raw_response={"stub": True},
        )
        return intent

    def capture(self, intent: PaymentIntent) -> PaymentIntent:
        intent.status = PaymentIntent.Status.CAPTURED
        intent.save()
        return intent

    def refund(self, intent: PaymentIntent, amount: Decimal) -> dict:
        return {"status": "stub_refund", "amount": str(amount)}


def get_gateway() -> PaymentGateway:
    return IyzicoGateway()
