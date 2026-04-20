# Ekim Craft

El yapımı, kişiye özel ve tek üretim ürünler satan butik atölyenin uçtan uca e-ticaret platformu.

## Yapı

```
ekim-craft/
├── backend/        Django 5.2 LTS + DRF + Celery
├── frontend/       Next.js 15 + TypeScript + Tailwind + shadcn/ui
├── shared/         OpenAPI schema (backend → frontend SDK)
└── .github/        CI workflows
```

## Gereksinimler

- Python 3.11+ (3.13 önerilir)
- Node 20+ (24 önerilir)
- pnpm 9+
- PostgreSQL 15+ (Neon cloud veya local)
- Redis 7+ (Celery için — Upstash veya local)

## İlk kurulum

```bash
# Repo'yu klonla
git clone <repo> ekim-craft
cd ekim-craft

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # DB + secret doldur
python manage.py migrate
python manage.py seed_demo       # 24 ürün + 6 kategori + admin
python manage.py runserver       # :8000

# Frontend (yeni terminal)
cd frontend
pnpm install
cp .env.example .env.local       # API URL vb.
pnpm dev                         # :3000
```

## Makefile kısa yolları

```bash
make dev          # backend + frontend paralel
make migrate      # Django migrate
make seed         # demo data
make gen-sdk      # OpenAPI → TS SDK
make test         # hepsi
make lint         # ruff + black + eslint
```

## Stack özeti

| Katman | Teknoloji |
|---|---|
| Backend | Django 5.2 LTS, DRF, drf-spectacular, SimpleJWT, Celery |
| Frontend | Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand |
| DB | PostgreSQL (Neon cloud) |
| Cache/queue | Redis (Upstash) |
| Depolama | Cloudflare R2 (S3-compatible) |
| Ödeme | iyzico |
| Email | Resend + React Email |
| SMS | NetGSM |
| Kargo | Aras / MNG / Yurtiçi |
| E-fatura | Logo İşbaşı |

## Geliştirme akışı

1. Backend'de model/endpoint ekle → `make gen-sdk` ile frontend SDK güncelle
2. Frontend'de typed client ile tüket
3. Her PR preview'da test et (Vercel preview + Railway dev branch)

## Dokümantasyon

- API şema: `/backend/api/schema/` (Swagger UI: `/api/docs/`)
- Tasarım referansı: `design_handoff_ekimcraft/` (proje dışında)
