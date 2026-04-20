"""
Demo veri seed'i — tasarım handoff/data.js'teki 24 ürün + 6 kategori + yorumlar.

Kullanım:
    python manage.py seed_demo          # veritabanını doldurur
    python manage.py seed_demo --reset  # önce mevcut demo içeriği siler
"""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.catalog.models import Category, Product, ProductVariant, Review
from apps.orders.models import Coupon

User = get_user_model()


CATEGORIES = [
    ("oyuncak", "Oyuncak"),
    ("hediyelik", "Hediyelik"),
    ("tablo", "Tablo"),
    ("saat", "Saat"),
    ("aksesuar", "Aksesuar"),
    ("dekor", "Ev Dekor"),
]


PRODUCTS = [
    # ----- OYUNCAK -----
    {
        "id": "p01", "name": "Ahşap İsimli Tren Seti", "category": "oyuncak",
        "price": 540, "old_price": 680, "stock": 24, "rating": 5.0, "reviews": 312,
        "tags": ["Çok satan"], "customizable": True, "size_type": "one-size",
        "sizes": [("4 vagon", 12), ("6 vagon", 8), ("8 vagon", 4)],
        "colors": [("Doğal kavak", "#d4b886"), ("Renkli", "#c17b5a")],
        "desc": "3+ yaş için ahşap tren seti. Vagonlara isim yazılır.",
        "materials": ["3mm kavak ahşap", "Su bazlı boya"], "care": "Nemli bezle silin.", "lead_time": "3-5 gün",
    },
    {
        "id": "p02", "name": "Montessori Şekil Eşleme", "category": "oyuncak",
        "price": 320, "stock": 38, "rating": 4.9, "reviews": 184,
        "tags": ["Çok satan"], "customizable": False, "size_type": "one-size",
        "sizes": [("12 parça", 38)],
        "colors": [("Doğal", "#d4b886")],
        "desc": "2+ yaş. El-göz koordinasyonu geliştirir.",
        "materials": ["MDF", "Su bazlı boya"], "care": "Kuru tutun.", "lead_time": "2-4 gün",
    },
    {
        "id": "p03", "name": "Ahşap Yapboz (Kişiye Özel)", "category": "oyuncak",
        "price": 240, "stock": 60, "rating": 4.9, "reviews": 96,
        "tags": ["Yeni"], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("20×20", 30), ("30×30", 20), ("40×40", 10)],
        "colors": [("Mat ahşap", "#c9a875")],
        "desc": "Fotoğrafını yükle, yapboz olarak basalım. 24-96 parça.",
        "materials": ["MDF"], "care": "Kuru tutun.", "lead_time": "3-5 gün",
    },
    {
        "id": "p04", "name": "Ahşap Bebek Diş Kaşıyıcı", "category": "oyuncak",
        "price": 120, "stock": 120, "rating": 5.0, "reviews": 412,
        "tags": [], "customizable": True, "size_type": "one-size",
        "sizes": [("Tek beden", 120)],
        "colors": [("Doğal kavak", "#d4b886")],
        "desc": "Doğal zeytin ahşabı. İsim kazınabilir.",
        "materials": ["Zeytin ahşabı"], "care": "Elde yıkayın.", "lead_time": "2-3 gün",
    },
    {
        "id": "p05", "name": "Ahşap Hayvan Figür Seti", "category": "oyuncak",
        "price": 280, "stock": 42, "rating": 4.8, "reviews": 138,
        "tags": [], "customizable": False, "size_type": "one-size",
        "sizes": [("6 figür", 42)],
        "colors": [("Renkli", "#c17b5a")],
        "desc": "Çiftlik hayvanları seti. 3+ yaş.",
        "materials": ["Kayın ahşabı"], "care": "Kuru tutun.", "lead_time": "3-5 gün",
    },
    {
        "id": "p06", "name": "Yapı Bloku Seti (50 parça)", "category": "oyuncak",
        "price": 420, "stock": 36, "rating": 4.9, "reviews": 158,
        "tags": ["Yeni"], "customizable": False, "size_type": "one-size",
        "sizes": [("50 parça", 36)],
        "colors": [("Doğal", "#d4b886")],
        "desc": "Klasik ahşap bloklar, pamuk torba ile.",
        "materials": ["Kayın ahşabı", "Pamuk torba"], "care": "-", "lead_time": "2-4 gün",
    },
    # ----- HEDİYELİK -----
    {
        "id": "p07", "name": "Doğum Günü İsim Süsü", "category": "hediyelik",
        "price": 180, "stock": 80, "rating": 5.0, "reviews": 224,
        "tags": ["Çok satan"], "customizable": True, "size_type": "one-size",
        "sizes": [("5 harf", 30), ("7 harf", 30), ("10 harf", 20)],
        "colors": [("Doğal", "#d4b886"), ("Beyaz", "#fafaf7"), ("Pembe", "#e8a8b8")],
        "desc": "Doğum günü için asılabilir isim süsü. Her harf 12 cm.",
        "materials": ["MDF", "Pamuk ip"], "care": "-", "lead_time": "2-3 gün",
    },
    {
        "id": "p08", "name": "Kişiye Özel Anahtarlık", "category": "hediyelik",
        "price": 85, "stock": 240, "rating": 4.9, "reviews": 502,
        "tags": ["Çok satan"], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("4×6", 120), ("5×8", 80), ("7×10", 40)],
        "colors": [("Doğal kavak", "#d4b886"), ("Koyu MDF", "#5d3a1f"), ("Şeffaf akrilik", "#e0e8e8")],
        "desc": "İsim, tarih ya da çizim ile. Metal halka dahil.",
        "materials": ["MDF / akrilik", "Metal halka"], "care": "-", "lead_time": "1-2 gün",
    },
    {
        "id": "p09", "name": "Kişiye Özel Kupa", "category": "hediyelik",
        "price": 220, "stock": 120, "rating": 4.8, "reviews": 198,
        "tags": [], "customizable": True, "size_type": "one-size",
        "sizes": [("330ml", 120)],
        "colors": [("Beyaz", "#fafaf7"), ("Siyah", "#1a1a1a"), ("Mat", "#d8d4ca")],
        "desc": "Fotoğraf / yazı baskılı seramik kupa. Bulaşık makinesi dayanıklı.",
        "materials": ["Seramik"], "care": "30°C bulaşık makinesinde yıkanabilir.", "lead_time": "2-3 gün",
    },
    {
        "id": "p10", "name": "Sevgili Hediye Kutusu", "category": "hediyelik",
        "price": 680, "old_price": 820, "stock": 18, "rating": 5.0, "reviews": 82,
        "tags": ["Çok satan"], "customizable": True, "size_type": "one-size",
        "sizes": [("Standart", 18)],
        "colors": [("Kraft", "#c9a875"), ("Siyah", "#2a2a28")],
        "desc": "Kişiye özel fotoğraf çerçevesi, mumlar, not defteri — hediye kutusu.",
        "materials": ["MDF", "Kağıt"], "care": "-", "lead_time": "3-5 gün",
    },
    {
        "id": "p11", "name": "Kişiye Özel Not Defteri", "category": "hediyelik",
        "price": 180, "stock": 60, "rating": 4.9, "reviews": 146,
        "tags": ["Yeni"], "customizable": True, "size_type": "apparel",
        "sizes": [("A5", 30), ("A6", 30)],
        "colors": [("Kraft", "#c9a875"), ("Siyah", "#2a2a28"), ("Bej", "#ede4cf")],
        "desc": "İsim ya da logo baskılı, 120 sayfa çizgisiz.",
        "materials": ["Kraft kapak", "120g kağıt"], "care": "-", "lead_time": "2-3 gün",
    },
    # ----- TABLO -----
    {
        "id": "p12", "name": "Kanvas Tablo", "category": "tablo",
        "price": 480, "stock": 60, "rating": 4.9, "reviews": 87,
        "tags": [], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("30×40", 20), ("50×70", 20), ("70×100", 20)],
        "colors": [("Mat", "#f0ebe0"), ("Parlak", "#fafaf7")],
        "desc": "Kendi fotoğrafın ya da seçtiğimiz tasarım. Kasalı, asmaya hazır.",
        "materials": ["Pamuk kanvas", "Ahşap kasa"], "care": "Nemli bez.", "lead_time": "3-5 gün",
    },
    {
        "id": "p13", "name": "Poster / Afiş", "category": "tablo",
        "price": 180, "stock": 999, "rating": 4.8, "reviews": 412,
        "tags": ["Çok satan"], "customizable": True, "size_type": "paper",
        "sizes": [("A4", 999), ("A3", 999), ("A2", 999), ("A1", 999)],
        "colors": [("Mat", "#f0ebe0"), ("Parlak", "#fafaf7"), ("Kuşe", "#e8e3d3")],
        "desc": "Fotoğraf kalitesinde poster baskı. 250g kağıt.",
        "materials": ["250g mat / parlak kağıt"], "care": "-", "lead_time": "1-2 gün",
    },
    {
        "id": "p14", "name": "Çerçeveli Mini Tablo Seti", "category": "tablo",
        "price": 420, "stock": 28, "rating": 4.9, "reviews": 64,
        "tags": ["Yeni"], "customizable": True, "size_type": "one-size",
        "sizes": [("3'lü set", 20), ("5'li set", 8)],
        "colors": [("Doğal", "#c9a875"), ("Siyah", "#1a1a1a"), ("Beyaz", "#fafaf7")],
        "desc": "Duvar kolajı için 15×20 çerçeveli set.",
        "materials": ["MDF çerçeve", "Cam"], "care": "-", "lead_time": "2-4 gün",
    },
    {
        "id": "p15", "name": "Ahşap Plak Baskı", "category": "tablo",
        "price": 340, "stock": 32, "rating": 5.0, "reviews": 118,
        "tags": [], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("20×30", 12), ("30×40", 12), ("40×60", 8)],
        "colors": [("Doğal", "#c9a875")],
        "desc": "Fotoğrafın doğrudan ahşap yüzeye basılı.",
        "materials": ["Kavak ahşap"], "care": "-", "lead_time": "3-5 gün",
    },
    # ----- SAAT -----
    {
        "id": "p16", "name": "Ahşap Duvar Saati", "category": "saat",
        "price": 380, "stock": 42, "rating": 4.9, "reviews": 156,
        "tags": ["Çok satan"], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("30 cm", 20), ("40 cm", 14), ("50 cm", 8)],
        "colors": [("Doğal", "#c9a875"), ("Koyu ceviz", "#5d3a1f"), ("Beyaz", "#fafaf7")],
        "desc": "Sessiz mekanizma. İsim ya da logo kazınabilir.",
        "materials": ["MDF", "Sessiz mekanizma"], "care": "Nemli bezle silin.", "lead_time": "3-5 gün",
    },
    {
        "id": "p17", "name": "Minimal Masa Saati", "category": "saat",
        "price": 260, "stock": 36, "rating": 4.8, "reviews": 78,
        "tags": ["Yeni"], "customizable": False, "size_type": "one-size",
        "sizes": [("Tek beden", 36)],
        "colors": [("Doğal", "#c9a875"), ("Siyah", "#1a1a1a")],
        "desc": "Ahşap gövde, sessiz mekanizma, AA pil dahil.",
        "materials": ["MDF", "Metal"], "care": "-", "lead_time": "2-3 gün",
    },
    {
        "id": "p18", "name": "Çocuk Odası Duvar Saati", "category": "saat",
        "price": 320, "stock": 28, "rating": 4.9, "reviews": 92,
        "tags": [], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("30 cm", 28)],
        "colors": [("Pembe", "#e8a8b8"), ("Mavi", "#8aa3b8"), ("Yeşil", "#8a9a7b")],
        "desc": "Renkli figürlü, çocuk odası için duvar saati.",
        "materials": ["MDF"], "care": "-", "lead_time": "2-4 gün",
    },
    # ----- AKSESUAR -----
    {
        "id": "p19", "name": "Ahşap Bileklik", "category": "aksesuar",
        "price": 120, "stock": 80, "rating": 4.8, "reviews": 142,
        "tags": [], "customizable": True, "size_type": "apparel",
        "sizes": [("S", 30), ("M", 30), ("L", 20)],
        "colors": [("Doğal", "#c9a875"), ("Koyu", "#5d3a1f")],
        "desc": "İsim ya da tarih kazınabilir ahşap bileklik.",
        "materials": ["Zeytin ahşabı"], "care": "Kuru tutun.", "lead_time": "1-2 gün",
    },
    {
        "id": "p20", "name": "Deri Cüzdan (Kişiye Özel)", "category": "aksesuar",
        "price": 580, "old_price": 720, "stock": 24, "rating": 4.9, "reviews": 88,
        "tags": ["Çok satan"], "customizable": True, "size_type": "one-size",
        "sizes": [("Standart", 24)],
        "colors": [("Kahve", "#5d3a1f"), ("Siyah", "#1a1a1a"), ("Taba", "#a87a52")],
        "desc": "Bitkisel tabaklı gerçek deri. İsim baskılı.",
        "materials": ["Gerçek deri"], "care": "Deri balsamı.", "lead_time": "3-5 gün",
    },
    {
        "id": "p21", "name": "Ahşap Güneş Gözlüğü", "category": "aksesuar",
        "price": 480, "stock": 32, "rating": 4.8, "reviews": 64,
        "tags": ["Yeni"], "customizable": False, "size_type": "one-size",
        "sizes": [("Tek beden", 32)],
        "colors": [("Bambu", "#c9a875"), ("Koyu ceviz", "#5d3a1f")],
        "desc": "UV400 polarize cam, bambu ahşap çerçeve.",
        "materials": ["Bambu ahşap", "UV400 cam"], "care": "Mikrofiber bez.", "lead_time": "2-3 gün",
    },
    # ----- DEKOR -----
    {
        "id": "p22", "name": "Ahşap Tabela / Yazı", "category": "dekor",
        "price": 320, "stock": 40, "rating": 4.9, "reviews": 86,
        "tags": [], "customizable": True, "size_type": "numeric-cm",
        "sizes": [("20×10", 18), ("40×15", 14), ("60×25", 8)],
        "colors": [("Doğal meşe", "#c9a875"), ("Koyu ceviz", "#5d3a1f")],
        "desc": "Kişiye özel yazılı tabela. Asmaya hazır.",
        "materials": ["MDF"], "care": "Kuru tutun.", "lead_time": "3-5 gün",
    },
    {
        "id": "p23", "name": "Soy İsim Kapı Süsü", "category": "dekor",
        "price": 240, "stock": 48, "rating": 5.0, "reviews": 128,
        "tags": ["Çok satan"], "customizable": True, "size_type": "one-size",
        "sizes": [("Tek beden", 48)],
        "colors": [("Doğal", "#c9a875"), ("Beyaz", "#fafaf7"), ("Siyah", "#1a1a1a")],
        "desc": "Ev kapınıza soy isimli süs. 30×10 cm.",
        "materials": ["MDF"], "care": "-", "lead_time": "2-3 gün",
    },
    {
        "id": "p24", "name": "Çocuk Boy Ölçer Tabela", "category": "dekor",
        "price": 380, "stock": 28, "rating": 4.9, "reviews": 86,
        "tags": ["Yeni"], "customizable": True, "size_type": "one-size",
        "sizes": [("150 cm", 28)],
        "colors": [("Doğal", "#c9a875"), ("Beyaz", "#fafaf7")],
        "desc": "Çocuğunuzun boyunu işaretleyin. İsim kazınır.",
        "materials": ["MDF"], "care": "-", "lead_time": "3-5 gün",
    },
]


REVIEWS = [
    {"pid": "p01", "user": "Ayşe D.", "rating": 5, "title": "Harika oldu", "body": "Oğlumun ismini yazdırdık, çok güzel bir işçilik çıktı. Teşekkürler!"},
    {"pid": "p01", "user": "Murat C.", "rating": 5, "title": "Kaliteli", "body": "Ahşap kalitesi gerçekten çok iyi. Vagonlar sağlam."},
    {"pid": "p08", "user": "Zeynep Y.", "rating": 5, "title": "Tam istediğim gibi", "body": "Hediye olarak aldım, kişiselleştirme harika."},
    {"pid": "p20", "user": "Kemal T.", "rating": 4, "title": "Güzel ama", "body": "Deri kalitesi iyi, sadece kargo biraz gecikti."},
]


COUPONS = [
    {"code": "ILKSIPARIS", "type": "percent", "value": 10, "min_order": 200, "usage_limit": 1000},
    {"code": "KARGO100", "type": "free_ship", "value": 0, "min_order": 500, "usage_limit": None},
    {"code": "BAHAR25", "type": "fixed", "value": 50, "min_order": 300, "usage_limit": 500},
]


class Command(BaseCommand):
    help = "Demo verisini yükler (24 ürün, 6 kategori, yorumlar, admin kullanıcı, kuponlar)"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Önce mevcut demo verisini siler")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write(self.style.WARNING("Demo veri siliniyor..."))
            Review.objects.all().delete()
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Coupon.objects.filter(code__in=[c["code"] for c in COUPONS]).delete()

        # ----- Kategoriler -----
        cat_map: dict[str, Category] = {}
        for idx, (slug, name) in enumerate(CATEGORIES):
            cat, _ = Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "sort_order": idx * 10, "is_visible": True},
            )
            cat_map[slug] = cat
        self.stdout.write(self.style.SUCCESS(f"✓ {len(cat_map)} kategori"))

        # ----- Ürünler + Varyantlar -----
        for data in PRODUCTS:
            product, created = Product.objects.update_or_create(
                slug=slugify(data["name"]),
                defaults={
                    "name": data["name"],
                    "category": cat_map[data["category"]],
                    "sku": data["id"].upper(),
                    "price": Decimal(str(data["price"])),
                    "old_price": Decimal(str(data["old_price"])) if data.get("old_price") else None,
                    "description": data["desc"],
                    "materials": data["materials"],
                    "care": data["care"],
                    "lead_time": data["lead_time"],
                    "tags": data["tags"],
                    "customizable": data["customizable"],
                    "size_type": data["size_type"],
                    "rating": Decimal(str(data["rating"])),
                    "review_count": data["reviews"],
                    "is_visible": True,
                },
            )
            # Varyantlar: size x color kombinasyonları
            product.variants.all().delete()
            for size_label, size_stock in data["sizes"]:
                for color_name, color_hex in data["colors"]:
                    # Stok rengi başına eşit paylaştırılır
                    per_color = max(1, size_stock // max(1, len(data["colors"])))
                    ProductVariant.objects.create(
                        product=product,
                        size_label=size_label,
                        color_name=color_name,
                        color_hex=color_hex,
                        sku=f"{data['id'].upper()}-{slugify(size_label)}-{slugify(color_name)}"[:60],
                        stock=per_color,
                    )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(PRODUCTS)} ürün + varyantlar"))

        # ----- Yorumlar -----
        Review.objects.filter(product__sku__in=[r["pid"].upper() for r in REVIEWS]).delete()
        for r in REVIEWS:
            try:
                prod = Product.objects.get(sku=r["pid"].upper())
            except Product.DoesNotExist:
                continue
            Review.objects.create(
                product=prod,
                author_name=r["user"],
                rating=r["rating"],
                title=r["title"],
                body=r["body"],
                is_approved=True,
                is_verified_purchase=True,
                helpful=8,
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(REVIEWS)} yorum"))

        # ----- Kuponlar -----
        for c in COUPONS:
            Coupon.objects.update_or_create(
                code=c["code"],
                defaults={
                    "type": c["type"],
                    "value": Decimal(str(c["value"])),
                    "min_order": Decimal(str(c["min_order"])),
                    "usage_limit": c["usage_limit"],
                    "is_active": True,
                },
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(COUPONS)} kupon"))

        # ----- Admin kullanıcı -----
        admin, created = User.objects.get_or_create(
            email="admin@ekimcraft.com",
            defaults={"first_name": "Ekim", "last_name": "Admin", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("ekim2026")
            admin.save()
            self.stdout.write(self.style.SUCCESS("✓ Admin oluşturuldu: admin@ekimcraft.com / ekim2026"))
        else:
            self.stdout.write(self.style.WARNING("ℹ Admin zaten var"))

        # ----- Demo müşteri -----
        demo, created = User.objects.get_or_create(
            email="deniz@ekimcraft.com",
            defaults={"first_name": "Deniz", "last_name": "Kaya", "phone": "0532 123 4567"},
        )
        if created:
            demo.set_password("demo1234")
            demo.save()
            self.stdout.write(self.style.SUCCESS("✓ Demo müşteri: deniz@ekimcraft.com / demo1234"))

        self.stdout.write(self.style.SUCCESS("\n✅ Demo veri hazır."))
