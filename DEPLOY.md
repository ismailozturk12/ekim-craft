# Ekim Craft — Production Deploy Kılavuzu

> Bu dosya Faz 14 için hazır. Sunucu sağlayıcı (kullanıcı tercihi) belirlendiğinde somut adımlarla tamamlanacak.

## 🧱 Bileşenler

| Katman | Servis | Plan |
|---|---|---|
| Frontend (Next.js 16) | Vercel / Netlify / kendi VPS | Static + SSR |
| Backend (Django + DRF) | Railway / Fly.io / Render / kendi VPS | Gunicorn + Nginx |
| Celery worker + beat | Aynı sağlayıcı | Redis kullanır |
| Postgres | Neon / Supabase / managed | SSL zorunlu |
| Redis | Upstash / managed | TLS |
| Object storage | Cloudflare R2 | S3 API, CDN dahil |
| CDN / cache | Cloudflare | Frontend önünde |
| Error tracking | Sentry | Backend + frontend |
| Uptime | BetterStack / Uptime Kuma | 1dk ping |

## 🔐 Env vars — production

### Backend (backend/.env veya sağlayıcı secret)
```
DJANGO_SECRET_KEY=<openssl rand -hex 32>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.ekimcraft.com

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
REDIS_URL=rediss://default:pass@host:port/0

CORS_ALLOWED_ORIGINS=https://ekimcraft.com,https://www.ekimcraft.com

JWT_SIGNING_KEY=<openssl rand -hex 32>
JWT_ACCESS_LIFETIME_MIN=15
JWT_REFRESH_LIFETIME_DAYS=30

# İntegrasyon key'leri prod aktifken doldurulur
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://api.iyzipay.com

RESEND_API_KEY=
EMAIL_FROM=Ekim Craft <hello@ekimcraft.com>

NETGSM_USERCODE=
NETGSM_PASSWORD=
NETGSM_MSGHEADER=EKIMCRAFT

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=ekim-craft-media
R2_PUBLIC_URL=https://cdn.ekimcraft.com

LOGO_ISBASI_USERNAME=
LOGO_ISBASI_PASSWORD=
LOGO_ISBASI_COMPANY_ID=

ARAS_USERNAME=
ARAS_PASSWORD=
ARAS_CUSTOMER_CODE=

SENTRY_DSN=
SENTRY_ENV=production
```

### Frontend (.env.production veya Vercel env)
```
NEXT_PUBLIC_API_URL=https://api.ekimcraft.com
NEXT_PUBLIC_SITE_URL=https://ekimcraft.com
```

## 🚀 Launch checklist

### Altyapı
- [ ] Alan adı alındı (ekimcraft.com)
- [ ] DNS kayıtları (A → frontend, api → backend)
- [ ] SSL sertifikaları (Let's Encrypt / Vercel)
- [ ] Neon prod branch + bağlantı havuzu (pgBouncer)
- [ ] Upstash Redis prod
- [ ] Cloudflare R2 bucket + custom domain
- [ ] Sentry projesi (frontend + backend)

### Backend
- [ ] `DJANGO_SECRET_KEY` ve `JWT_SIGNING_KEY` güvenli şekilde üretildi
- [ ] `DEBUG=False`, `ALLOWED_HOSTS` düzgün
- [ ] `python manage.py migrate`
- [ ] `python manage.py seed_demo` (yalnızca ilk çalıştırmada demo için; prod'da *gerçek* ürünler yüklenecek)
- [ ] `python manage.py createsuperuser`
- [ ] `collectstatic` CDN'e
- [ ] Gunicorn çalışıyor, Nginx/Railway router önde
- [ ] Celery worker ve beat (sync + fatura batch)
- [ ] Cron: saatlik pazaryeri senkron, günlük stok raporu, gecelik DB backup

### Frontend
- [ ] Vercel projesi bağlandı, env vars girildi
- [ ] Build log temiz
- [ ] Sitemap ve robots.txt prod URL'de
- [ ] Core Web Vitals Lighthouse ≥ 90
- [ ] Image upload path'i R2'ye gidiyor

### Ödeme & entegrasyonlar (sıralı)
- [ ] iyzico canlı key'ler + 3DS webhook URL kayıtlı
- [ ] Aras / MNG / Yurtiçi API'ları test
- [ ] Logo İşbaşı bağlantısı + test fatura
- [ ] NetGSM gönderici kaynağı onaylı
- [ ] Resend SPF / DKIM doğrulanmış
- [ ] Trendyol / Hepsiburada / Etsy anahtarları hazır (kademeli aç)

### Yasal
- [ ] KVKK Envanteri + VERBİS (gerekirse) kayıt
- [ ] ETBİS kayıt
- [ ] Mesafeli satış sözleşmesi güncel
- [ ] Vergi levhası footer
- [ ] Çerez banner aktif

### Monitoring
- [ ] Uptime kontrol (BetterStack)
- [ ] Sentry alert kuralları
- [ ] PostHog / GA4 yüklü
- [ ] Log drain (Logtail / Datadog)

### Rollback planı
- Frontend: Vercel `Revert to previous deployment`
- Backend: Railway / Fly.io `rollback` komutu
- DB: Neon point-in-time restore (7 gün)
- Redis: Upstash snapshot

## 🧪 Smoke test (launch sonrası)

```bash
curl -f https://api.ekimcraft.com/health/
curl -f https://api.ekimcraft.com/api/v1/catalog/categories/
curl -f https://ekimcraft.com/
curl -f https://ekimcraft.com/kategori/all
curl -f https://ekimcraft.com/urun/<bir-slug>
curl -f https://ekimcraft.com/robots.txt
curl -f https://ekimcraft.com/sitemap.xml
```

## 🔁 Sürekli iyileştirme

- A/B test (PostHog flags) — checkout butonu, hero kopyası
- Crisp / Intercom canlı destek widget
- Loyalty programı (v2)
- PWA + push notification (v2)
- Mobil app (React Native Expo, v2)
