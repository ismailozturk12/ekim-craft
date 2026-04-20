"""
E-fatura entegrasyonu — Logo İşbaşı / Uyumsoft iskelet.

Türkiye'de GİB'e elektronik arşiv ve e-fatura entegrasyonu için Logo İşbaşı
varsayılan entegratördür. 2.5M TL üstü ciroda zorunludur.

Ortak arayüz:
    Provider.issue_archive(order) -> {uuid, xml_url, pdf_url}
    Provider.issue_invoice(order) -> {uuid, xml_url, pdf_url}
    Provider.cancel(uuid) -> bool
"""

from __future__ import annotations

from typing import Protocol

from django.conf import settings

from apps.orders.models import Order


class InvoicingProvider(Protocol):
    def issue_archive(self, order: Order) -> dict: ...
    def issue_invoice(self, order: Order) -> dict: ...
    def cancel(self, uuid: str) -> bool: ...


class LogoIsbasiProvider:
    """Stub — Faz 11'de gerçek Logo İşbaşı API ile doldurulacak."""

    def __init__(self) -> None:
        self.username = getattr(settings, "LOGO_ISBASI_USERNAME", None)
        self.password = getattr(settings, "LOGO_ISBASI_PASSWORD", None)
        self.company_id = getattr(settings, "LOGO_ISBASI_COMPANY_ID", None)

    def issue_archive(self, order: Order) -> dict:
        return {
            "uuid": f"logo-archive-{order.number}",
            "xml_url": f"https://files.ekimcraft.com/efatura/{order.number}.xml",
            "pdf_url": f"https://files.ekimcraft.com/efatura/{order.number}.pdf",
            "status": "stub",
        }

    def issue_invoice(self, order: Order) -> dict:
        return self.issue_archive(order)

    def cancel(self, uuid: str) -> bool:
        return True


def get_provider() -> InvoicingProvider:
    return LogoIsbasiProvider()
