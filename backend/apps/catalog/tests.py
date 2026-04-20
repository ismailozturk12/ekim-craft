"""Katalog smoke testleri."""

import pytest
from rest_framework.test import APIClient

from .models import Category, Product

pytestmark = pytest.mark.django_db


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def category():
    return Category.objects.create(slug="oyuncak", name="Oyuncak")


@pytest.fixture
def product(category):
    return Product.objects.create(
        slug="ahsap-tren",
        name="Ahşap Tren",
        category=category,
        sku="TEST-AHT",
        price=540,
        description="Test",
        is_visible=True,
    )


def test_health(client):
    res = client.get("/health/")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_categories_list(client, category):
    res = client.get("/api/v1/catalog/categories/")
    assert res.status_code == 200
    assert any(c["slug"] == "oyuncak" for c in res.json())


def test_products_list(client, product):
    res = client.get("/api/v1/catalog/products/")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 1
    names = [p["name"] for p in data["results"]]
    assert "Ahşap Tren" in names


def test_product_detail(client, product):
    res = client.get(f"/api/v1/catalog/products/{product.slug}/")
    assert res.status_code == 200
    assert res.json()["slug"] == product.slug


def test_products_filter_by_category(client, product):
    other, _ = Category.objects.get_or_create(slug="hediyelik", defaults={"name": "Hediyelik"})
    Product.objects.create(slug="kupa", name="Kupa", category=other, sku="TEST-KP", price=220)
    res = client.get("/api/v1/catalog/products/?category=oyuncak")
    slugs = [p["slug"] for p in res.json()["results"]]
    assert "ahsap-tren" in slugs
    assert "kupa" not in slugs
