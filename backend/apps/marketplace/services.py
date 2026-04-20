"""
Pazaryeri entegrasyon iskeleti — Trendyol, Hepsiburada, Etsy.

Her pazaryeri için:
    - Ürün senkron (Ekim → Pazaryeri)
    - Sipariş çekme (Pazaryeri → Ekim)
    - Stok senkron
    - Fiyat senkron

Celery periodic task'ı saatlik çalıştırır.
"""

from __future__ import annotations

from typing import Protocol


class MarketplaceAdapter(Protocol):
    slug: str

    def sync_products(self) -> dict: ...
    def pull_orders(self) -> list[dict]: ...
    def update_stock(self, sku: str, stock: int) -> bool: ...


class TrendyolAdapter:
    slug = "trendyol"

    def sync_products(self) -> dict:
        return {"synced": 0, "errors": []}

    def pull_orders(self) -> list[dict]:
        return []

    def update_stock(self, sku: str, stock: int) -> bool:
        return True


class HepsiburadaAdapter:
    slug = "hepsiburada"

    def sync_products(self) -> dict:
        return {"synced": 0, "errors": []}

    def pull_orders(self) -> list[dict]:
        return []

    def update_stock(self, sku: str, stock: int) -> bool:
        return True


class EtsyAdapter:
    slug = "etsy"

    def sync_products(self) -> dict:
        return {"synced": 0, "errors": []}

    def pull_orders(self) -> list[dict]:
        return []

    def update_stock(self, sku: str, stock: int) -> bool:
        return True


ADAPTERS = {
    "trendyol": TrendyolAdapter,
    "hepsiburada": HepsiburadaAdapter,
    "etsy": EtsyAdapter,
}


def get_adapter(slug: str) -> MarketplaceAdapter:
    return ADAPTERS[slug]()
