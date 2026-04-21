# CLAUDE.md — Ekim Craft

Bu dosya bu repoda çalışan Claude oturumları için yazıldı. İlk önce bunu oku, sonra işe başla.

## Proje nedir

**Ekim Craft** — el yapımı, kişiye özel ve tek üretim ürünler (oyuncak, hediyelik, tablo, saat, aksesuar, dekor) satan butik atölyenin uçtan uca e-ticaret platformu.

- **Canlı:** https://ekimcraft.com (apex canonical, www/api redirect)
- **Dil:** Türkçe (tr_TR locale zorunlu, UI kopyaları Türkçe)
- **Kullanıcılar:** müşteri + staff (admin panel `/yonetim`)
- **Repo:** https://github.com/ismailozturk12/ekim-craft (public)

## Stack

### Backend (`backend/`)
- Python 3.12+ · **Django 5.2 LTS** · DRF · SimpleJWT (refresh rotation + blacklist)
- **PostgreSQL 16** (prod) / SQLite fallback (dev — ama DATABASE_URL set edilirse DB'ye bağlanır)
- Redis 7 (cache/Celery için — Celery scaffold var ama şu an aktif değil)
- drf-spectacular (OpenAPI), django-filter, django-storages, corsheaders, django-environ
- Custom User model: `accounts.User` (email auth)

### Frontend (`frontend/`)
- **Next.js 16 App Router** · React 19 · TypeScript strict
- **Tailwind CSS v4** (`@theme inline` directive) · shadcn/ui components (base-ui under the hood, NOT Radix)
- Zustand (persist middleware) · TanStack Query · sonner (toast)
- Fraunces (serif) + Inter Tight (sans) + JetBrains Mono (mono)
- pnpm 10

### Deploy
- Hetzner Ubuntu 24.04 LTS (2 core, 3.7 GB RAM, 75 GB disk)
- systemd services: `ekim-backend` (gunicorn:8000), `ekim-frontend` (next:3000), `nginx`, `postgresql`, `redis-server`
- Let's Encrypt SSL (certbot --nginx, auto-renew)
- 2 GB swap, UFW (22/80/443), `vm.swappiness=10`
- **Sunucu:** `ssh root@178.104.226.41` (key-based, password auth hâlâ açık — ilerde kapatılabilir)
- **App path:** `/srv/ekim-craft` (user: `ekim`)

## Repo yapısı

```
ekim-craft/
├── backend/
│   ├── apps/
│   │   ├── accounts/        User, Address, PaymentMethod, auth views (register/login/change-password/password-reset)
│   │   ├── catalog/         Product, Category, ProductImage, ProductVariant, Review, ReviewPhoto, WishlistItem
│   │   ├── orders/          Cart, CartItem, Coupon, Order, OrderItem, OrderEvent, ReturnRequest, ReturnRequestItem
│   │   ├── core/            Setting, ContactMessage, NewsletterSubscriber, AuditLog, Webhook, ApiKey + seed_demo command
│   │   ├── studio/          Kişiselleştirme pipeline (template, preview, asset)
│   │   ├── payments/        iyzico + wallet scaffold (gerçek entegrasyon eksik — simüle)
│   │   ├── shipping/        Carrier, Shipment, tracking webhook
│   │   ├── invoicing/       e-arşiv fatura scaffold
│   │   ├── marketplace/     Trendyol/N11 feed scaffold (şu an aktif değil)
│   │   └── notifications/   EmailTemplate, NotificationLog, services
│   ├── ekim/                settings, urls, wsgi, asgi, celery, security (SecurityHeadersMiddleware + SimpleRateLimit)
│   └── media/               Django FileField uploads (product images, review photos)
│
├── frontend/
│   ├── src/
│   │   ├── app/             Route handlers (App Router)
│   │   │   ├── (storefront) /, /kategori/[slug], /urun/[slug], /sepet, /odeme, /siparis-basarili/[number],
│   │   │   │                /arama, /giris, /sifremi-unuttum, /sifre-sifirla/[token]
│   │   │   │                yasal: /hakkimizda, /iletisim, /sss, /kargo, /iade, /kvkk, /gizlilik, /mesafeli-satis, /kullanim-sartlari
│   │   │   ├── hesap/       /hesap (genel), /siparisler, /iadeler, /favoriler, /adresler, /kartlar, /ayarlar, /yardim
│   │   │   ├── yonetim/     Admin panel: /pano, /siparisler, /iadeler, /urunler, /stok, /musteriler,
│   │   │   │                /kampanyalar, /kargo, /finans, /raporlar, /bildirimler, /ayarlar
│   │   │   ├── layout.tsx   Metadata + Organization+WebSite JSON-LD
│   │   │   ├── sitemap.ts   Dinamik sitemap (API'den ürün + kategori çekiyor)
│   │   │   ├── robots.ts    /admin/, /hesap/, /yonetim/ disallow
│   │   │   ├── manifest.ts  PWA manifest
│   │   │   └── apple-icon.tsx  ImageResponse ile dinamik 180×180 icon
│   │   ├── components/
│   │   │   ├── ekim/        Proje-özgü bileşenler (ProductCard, ProductGallery, CartDrawer, SearchDialog, …)
│   │   │   ├── layout/      Header, Footer
│   │   │   ├── seo/         JsonLd
│   │   │   ├── ui/          shadcn/ui (Dialog, Sheet, Dropdown, Accordion, …)
│   │   │   └── providers.tsx  ThemeProvider + QueryClientProvider + Toaster + WishlistLoader
│   │   ├── lib/
│   │   │   ├── api/client.ts  fetch wrapper + domain types (ApiProductList, ApiReturnDetail, …)
│   │   │   ├── seo.ts       SITE_URL, JSON-LD helpers (organization, website, product, breadcrumb, faq)
│   │   │   ├── format.ts    formatTL, formatDateShort, discountPercent
│   │   │   └── utils.ts     cn()
│   │   ├── store/
│   │   │   ├── auth.ts      Zustand persist + useAuthHydrated + authedFetch (auto-refresh) + apiErrorMessage
│   │   │   ├── cart.ts      LocalStorage cart
│   │   │   └── wishlist.ts  Favorites sync
│   │   └── types/catalog.ts UI tipleri (Product — API tipleriyle ayrı, mapProduct ile çevriliyor)
│   └── public/              Statik assetler
│
├── DEPLOY.md                Eski deploy notları (yarıları stale)
├── Makefile                 make dev-back / dev-front / gen-sdk / test
└── README.md                Kurulum + komutlar
```

## Günlük komutlar

**Frontend:**
```bash
cd frontend
pnpm dev          # :3000 (Turbopack)
pnpm build        # prod build
pnpm lint         # eslint (uyar, fail olmaz)
pnpm typecheck    # tsc --noEmit
```

**Backend:**
```bash
cd backend
source .venv/bin/activate
DJANGO_SECRET_KEY=dev DJANGO_DEBUG=True python manage.py runserver  # :8000
python manage.py makemigrations <app>
python manage.py migrate
python manage.py seed_demo           # apps/core/management/commands — 24 ürün, 3 kupon, admin + müşteri
python manage.py createsuperuser
```

**Deploy (manuel):**
```bash
# Local'de commit + push
git commit -m "..." && git push

# Sunucuda pull + build + restart
ssh root@178.104.226.41 "sudo -u ekim bash -c 'cd /srv/ekim-craft && git pull && cd backend && .venv/bin/python manage.py migrate --noinput && .venv/bin/python manage.py collectstatic --noinput && cd ../frontend && pnpm build' && systemctl restart ekim-backend ekim-frontend"
```

Kaçırma: migration eklediysen `migrate`; statik dosya değiştiysen `collectstatic`; UI değiştiysen `pnpm build`; backend kodu değiştiysen gunicorn restart.

## Mimari kararlar ve kurallar

### Auth
- **SimpleJWT** access (30 dk) + refresh (30 gün, rotation + blacklist)
- Frontend `store/auth.ts` içinde `authedFetch()` 401 → refresh → retry otomatik
- `useAuthHydrated()` — SSR hydration için zorunlu; `useEffect(!hydrated) return` pattern'i her korumalı sayfada
- `apiErrorMessage(res)` — nested DRF error object → human string (tüm hata toast'larında kullan)

### API
- Path: `/api/v1/...` — örn. `/api/v1/catalog/products/`, `/api/v1/orders/returns/`
- `NEXT_PUBLIC_API_URL` → base URL (prod: `https://ekimcraft.com`, apex ile aynı origin kullanılıyor; CORS gereksiz)
- Django `SECURE_PROXY_SSL_HEADER` Nginx'ten `X-Forwarded-Proto https` okuyor
- Sipariş numarası: `EK-XXXXX` (5 digit random); iade numarası: `IAD-YYYYMMDD-NNNN`

### Django ayarları
- `ekim/settings.py` env-driven. Kritik env var'ları:
  - `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`
  - `DJANGO_SECURE_SSL_REDIRECT`, `DJANGO_SESSION_COOKIE_SECURE`, `DJANGO_CSRF_COOKIE_SECURE` (prod'da `True`)
  - `DJANGO_CSRF_TRUSTED_ORIGINS` (comma-separated, scheme dahil)
  - `CORS_ALLOWED_ORIGINS` (şu an apex ile aynı origin olduğundan kullanımı minimal)
- **Rate limit:** `ekim/security.py` içinde `SimpleRateLimit` middleware — DEBUG=True'da bypass ediliyor
- **DATABASE_URL** yoksa SQLite fallback

### Frontend kuralları
- **Next.js 16 is NOT what you know.** `frontend/AGENTS.md` uyarısı: API / konvansiyon değişmiş olabilir. Kodu yazmadan önce gerekiyorsa `node_modules/next/dist/docs/` oku.
- `async params` / `async searchParams` — `await params` ya da React `use(params)` pattern'i (client component'ta `use()` kullanıyoruz)
- `useSearchParams()` çağıran sayfa **Suspense** ile sarılmalı — build hatası yoksa browser'da hata verir
- **Tailwind v4:** `.h-1 / .h-2 / .h-3` typography helper'ları. `h-*` height utility'leri CONFLICT ediyor — `globals.css` içinde `@layer utilities` ile `height: auto !important` override var. Yeni `h-*` sınıfı tanımlamadan önce kontrol et.
- Fraunces descender overflow (g/y/ş) nedeniyle `.h-1/.h-2/.h-3` line-height 1.2 + `padding-bottom: 0.08em`
- **shadcn/ui base-ui tabanlı (Radix değil!):**
  - `DropdownMenuLabel` bir `<Menu.Group>` parent olmadan çalışmaz → plain `<div>` kullan
  - `DropdownMenuTrigger asChild` desteklenmiyor → direkt render et
  - `DialogContent` / `SheetContent` default `gap-4` var → `!gap-0` ile override
  - **Transparan görünmemesi için** `!bg-[var(--ek-bg-elevated)]` + `shadow-2xl` kullan (`bg-popover` güvenilir değil)

### Tasarım sistemi
- **Renkler** (CSS custom props, `--ek-*` prefix):
  - **Terracotta:** `--ek-terra` (CTA, accent) · `--ek-terra-2` (hover)
  - **Forest:** `--ek-forest` (header, footer, buttons) · `--ek-forest-2` (hover)
  - **Cream:** `--ek-cream` (metin on dark, backgrounds)
  - **Ink:** `--ek-ink` / `--ek-ink-2` / `--ek-ink-3` / `--ek-ink-4` (text scale)
  - **BG:** `--ek-bg` / `--ek-bg-elevated` / `--ek-bg-card`
  - **Line:** `--ek-line` / `--ek-line-2` (borders)
  - **Semantic:** `--ek-ok` (success) · `--ek-warn` (danger) · `--ek-blue` (info) · `--ek-sage`
- **Fontlar:** `--font-fraunces` (başlık) · `--font-inter-tight` (body) · `--font-jetbrains` (`.mono` class)
- **Shadcn variants:** neutral, info, success, warn, danger, sage (NOT "warning")
- **Kopyalar:** Her zaman Türkçe, KDV dahil fiyat, ₺ simgesi + `formatTL()` ile
- **Emoji:** Kullanıcı istemediyse kullanma (CLAUDE varsayılan kuralı)

### Mobile
- Hamburger + Sheet drawer (`components/layout/header.tsx`) — user avatar/profil CTA + kategori + hesap kısayolları + yardım linkleri + çıkış
- Kategori filtreleri mobilde Sheet drawer'da (`Filtrele` butonu), desktop'ta sticky sidebar
- Admin layout da mobilde hamburger + Sheet
- Admin tabloları `<div className="overflow-x-auto"><table className="min-w-[640px]">` pattern'i (10 tablo)
- `theme-color` light/dark Viewport meta açık; `apple-icon.tsx` dinamik ImageResponse

### SEO
- **SITE_URL** env: `https://ekimcraft.com` — kanonik apex
- Her sayfada `generateMetadata` yok ama static olanlar `export const metadata` kullanıyor
- JSON-LD: `lib/seo.ts` içinde `organizationJsonLd`, `websiteJsonLd`, `productJsonLd`, `breadcrumbJsonLd`, `faqJsonLd`
- Sitemap dinamik — backend API'den 500 ürün + kategori çekiyor, `lastmod` ürünün gerçek `updated_at`'ı
- Google Site Verification: `vxlQEDNH1YlzF8ImpRjARD23io0xzRgvvdFjxYCRFzE` (TXT DNS + meta — prod env'de `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)

### Dönemsel özellikler / durum
- **Ödeme:** iyzico scaffold var, gerçek 3DSecure akışı simüle. Order → `status=pending/paid` manuel güncelleniyor.
- **Kişiselleştirme (`/tasarim`):** **pasif** — sayfa 404 döndürüyor, sitemap ve header menüden kaldırıldı. Geri açıldığında `app/tasarim/page.tsx` gerçek modülle değiştirilecek.
- **Email doğrulama:** YOK (kullanıcı istemedi). Register direkt aktif kullanıcı oluşturuyor.
- **E-posta backend:** dev'de console, prod'da SMTP scaffold var ama SMTP credentials girilmedi → `fail_silently=True` ile gönderilmemiş gibi davranıyor. SMTP'yi ayarlarken `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` env'leri ekle.
- **İade akışı:** komple (model, API, müşteri dialog, admin yönetim). Otomatik kargo iadesi şu an **dahil değil** — admin refund_amount'u elle düzenleyebiliyor.

## Gotchas ve geçmiş hatalar

- **Tailwind v4 `.h-1/.h-2/.h-3` conflict:** Typography helper'ları `height` utility ile çakışıyor. `globals.css @layer utilities` override ile çözüldü.
- **Sheet/Dialog transparan görünüyor:** `bg-popover` güvenilir değil. `!bg-[var(--ek-bg-elevated)]` zorunlu + `shadow-2xl`.
- **`DropdownMenuLabel` MenuGroupRootContext hatası:** `Menu.Group` parent olmadan kullanılırsa patlıyor. Plain `<div>` ile değiştir.
- **`useSearchParams()` Suspense hatası:** `/giris`, `/arama`, `/sifre-sifirla` sayfaları `<Suspense>` ile sarılı. Yeni sayfa eklerken unutma.
- **Next 16 Turbopack cache:** `.sst` dosya hatası → `rm -rf .next && pnpm build`.
- **Django SECURE_SSL_REDIRECT:** HTTP fallback gerekirse `.env`'de `DJANGO_SECURE_SSL_REDIRECT=False` zorunlu — yoksa 301 loop.
- **nginx 1.24 `http2 on;` yok:** inline `listen 443 ssl http2;` kullan (1.25+ için standalone directive).
- **Rate limit 429 dev'de:** `DEBUG=True` iken bypass açık (ekim/security.py).
- **Management command yok:** `apps/core/management/commands/seed_demo.py` sadece; yeni komut eklerken `apps.core` dışındaki app'lerde de `management/__init__.py` + `commands/__init__.py` lazım.

## Test hesapları

- **Admin:** `admin@ekimcraft.com` — şifre sunucuda `/tmp/ekim-new-admin.txt` (repo'ya yazma).
- **Demo müşteri:** `deniz@ekimcraft.com` / `demo1234` (seed'den).

Gerçek prod şifrelerini repo'ya asla yazma. Şifre rotate etmek için:
```bash
ssh root@178.104.226.41 'sudo -u ekim bash -c "cd /srv/ekim-craft/backend && set -a; source .env; set +a; .venv/bin/python manage.py changepassword admin@ekimcraft.com"'
```

## İş akışı kuralları

1. **Küçük değişiklik → direkt commit + push + deploy.** Tek yerde test edilir, kod birincil kaynak.
2. **Değişiklik sonrası canlıda smoke test et.** `curl -s -o /dev/null -w '%{http_code}\n' https://ekimcraft.com/...` yeter.
3. **Migration eklediysen deploy'da `migrate` çalıştırmayı unutma.** Otherwise 500 verir.
4. **shared/openapi.yaml + make gen-sdk aktif değil** şu an — `lib/api/client.ts` elle güncelleniyor. Yeni endpoint eklersen orada da tip ekle.
5. **Destructive action (drop table, git reset --hard, force push, etc.) yapmadan önce sor.**
6. **Özellik ekledikten sonra `sitemap.ts` + `/yonetim/layout.tsx` NAV + `/hesap/layout.tsx` TABS güncel mi kontrol et.**

## Kalan ana işler

- [ ] iyzico gerçek entegrasyonu + 3D Secure callback
- [ ] E-posta SMTP credentials (transactional + welcome + iade bildirimleri)
- [ ] Celery worker/beat sistemd servisleri (şu an scaffold, çalışmıyor)
- [ ] Kişiselleştirme stüdyosu (`/tasarim` reaktivasyonu)
- [ ] e-arşiv fatura gerçek servis (şu an scaffold)
- [ ] Cron: orphan cart temizleme, stok senkronizasyonu
- [ ] SSH password auth disable (şu an açık) + SSH key-only + root disable
- [ ] SMS sağlayıcı (sipariş bildirimi — şu an sadece UI'da "SMS gönderilecek" yazısı)
- [ ] İade akışında otomatik kargo iadesi logic (hasarlı/yanlış ürün + tam iade senaryoları)
- [ ] Ürün filtresi: brand/size/color server-side filter bazı alanlarda çalışmıyor olabilir — doğrula

## Yardımcı

- **`/help`** — Claude Code yardımı
- **Feedback:** https://github.com/anthropics/claude-code/issues
