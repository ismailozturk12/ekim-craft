"""Celery pazaryeri senkron task'ları."""

from celery import shared_task

from .services import ADAPTERS, get_adapter


@shared_task
def sync_marketplace(slug: str) -> dict:
    adapter = get_adapter(slug)
    return adapter.sync_products()


@shared_task
def sync_all_marketplaces() -> dict:
    return {slug: get_adapter(slug).sync_products() for slug in ADAPTERS}


@shared_task
def pull_marketplace_orders(slug: str) -> list:
    return get_adapter(slug).pull_orders()
