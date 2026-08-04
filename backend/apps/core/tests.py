import io

from django.contrib.auth import get_user_model
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient

from .models import HeroBanner


def _png(name="banner.png", size=(60, 20)):
    buf = io.BytesIO()
    Image.new("RGB", size, "#bd7714").save(buf, format="PNG")
    buf.seek(0)
    buf.name = name
    return buf


class HeroBannerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user(
            email="staff@ekimcraft.com", password="x", is_staff=True
        )

    def test_public_bos_liste(self):
        res = self.client.get("/api/v1/core/banners/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"banners": []})

    def test_admin_anonim_giremez(self):
        res = self.client.get("/api/v1/core/admin/banners/")
        self.assertIn(res.status_code, (401, 403))

    def test_staff_yukler_public_gorur_pasif_gizlenir(self):
        self.client.force_authenticate(self.staff)
        res = self.client.post(
            "/api/v1/core/admin/banners/",
            {"image": _png(), "link": "/kategori/oyuncak", "title": "Kampanya", "sort_order": 1},
            format="multipart",
        )
        self.assertEqual(res.status_code, 201, res.content)
        res = self.client.post(
            "/api/v1/core/admin/banners/",
            {"image": _png("b2.png"), "link": "javascript:alert(1)", "active": False},
            format="multipart",
        )
        self.assertEqual(res.status_code, 201, res.content)
        # javascript: şeması düşer
        self.assertEqual(res.json()["link"], "")

        self.client.force_authenticate(None)
        data = self.client.get("/api/v1/core/banners/").json()["banners"]
        self.assertEqual(len(data), 1)  # pasif olan gizli
        self.assertEqual(data[0]["title"], "Kampanya")
        self.assertEqual(data[0]["link"], "/kategori/oyuncak")
        self.assertTrue(data[0]["image"].startswith("http"))

    def test_sira_alani_siralamayi_belirler(self):
        HeroBanner.objects.create(image="banners/a.png", sort_order=5, title="ikinci")
        HeroBanner.objects.create(image="banners/b.png", sort_order=1, title="ilk")
        data = self.client.get("/api/v1/core/banners/").json()["banners"]
        self.assertEqual([b["title"] for b in data], ["ilk", "ikinci"])
