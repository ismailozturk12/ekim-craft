"""
Kargo entegrasyon adaptörleri — Aras / MNG / Yurtiçi / PTT iskeleti.

Prod'da kullanım:
    Her taşıyıcının resmi SDK veya SOAP/REST endpoint'i ile doldurulacak.

Ortak arayüz:
    Carrier.create_shipment(order) -> Shipment
    Carrier.fetch_status(tracking_number) -> list[event]
    Carrier.cancel(shipment) -> bool
"""

from __future__ import annotations

from typing import Protocol

from apps.orders.models import Order

from .models import Shipment, ShippingProvider


class CarrierAdapter(Protocol):
    slug: str

    def create_shipment(self, order: Order) -> Shipment: ...
    def fetch_status(self, tracking_number: str) -> list[dict]: ...


class ArasAdapter:
    slug = "aras"

    def create_shipment(self, order: Order) -> Shipment:
        provider = ShippingProvider.objects.get(slug=self.slug)
        return Shipment.objects.create(
            order=order,
            provider=provider,
            tracking_number=f"ARS{order.pk:010d}",
            status=Shipment.Status.CREATED,
        )

    def fetch_status(self, tracking_number: str) -> list[dict]:
        return []


class MngAdapter:
    slug = "mng"

    def create_shipment(self, order: Order) -> Shipment:
        provider = ShippingProvider.objects.get(slug=self.slug)
        return Shipment.objects.create(
            order=order,
            provider=provider,
            tracking_number=f"MNG{order.pk:010d}",
            status=Shipment.Status.CREATED,
        )

    def fetch_status(self, tracking_number: str) -> list[dict]:
        return []


class YurticiAdapter:
    slug = "yurtici"

    def create_shipment(self, order: Order) -> Shipment:
        provider = ShippingProvider.objects.get(slug=self.slug)
        return Shipment.objects.create(
            order=order,
            provider=provider,
            tracking_number=f"YRC{order.pk:010d}",
            status=Shipment.Status.CREATED,
        )

    def fetch_status(self, tracking_number: str) -> list[dict]:
        return []


CARRIERS: dict[str, type[CarrierAdapter]] = {
    "aras": ArasAdapter,
    "mng": MngAdapter,
    "yurtici": YurticiAdapter,
}


def get_carrier(slug: str) -> CarrierAdapter:
    return CARRIERS[slug]()
