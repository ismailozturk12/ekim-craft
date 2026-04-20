.PHONY: help dev dev-backend dev-frontend dev-worker install migrate makemigrations seed gen-sdk test test-backend test-frontend lint lint-backend lint-frontend format shell superuser clean

help:
	@echo "Ekim Craft — Makefile komutları"
	@echo ""
	@echo "  make install           Backend + frontend bağımlılıkları"
	@echo "  make dev               Backend + frontend paralel (Ctrl+C ile durdur)"
	@echo "  make dev-backend       Django runserver :8000"
	@echo "  make dev-frontend      Next.js dev :3000"
	@echo "  make dev-worker        Celery worker"
	@echo "  make migrate           DB migrate"
	@echo "  make makemigrations    Migration oluştur"
	@echo "  make seed              Demo data yükle"
	@echo "  make gen-sdk           OpenAPI → frontend TS SDK"
	@echo "  make test              Tüm testler"
	@echo "  make lint              ruff + black + eslint"
	@echo "  make format            Oto-format"
	@echo "  make shell             Django shell"
	@echo "  make superuser         Admin kullanıcı oluştur"

install:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	cd frontend && pnpm install

dev:
	@command -v concurrently >/dev/null 2>&1 || (echo "concurrently yok; 'npm i -g concurrently' ile kur" && exit 1)
	concurrently -n backend,frontend -c blue,magenta \
		"cd backend && . .venv/bin/activate && python manage.py runserver 8000" \
		"cd frontend && pnpm dev"

dev-backend:
	cd backend && . .venv/bin/activate && python manage.py runserver 8000

dev-frontend:
	cd frontend && pnpm dev

dev-worker:
	cd backend && . .venv/bin/activate && celery -A ekim worker -B -l info

migrate:
	cd backend && . .venv/bin/activate && python manage.py migrate

makemigrations:
	cd backend && . .venv/bin/activate && python manage.py makemigrations

seed:
	cd backend && . .venv/bin/activate && python manage.py seed_demo

gen-sdk:
	cd backend && . .venv/bin/activate && python manage.py spectacular --format openapi-json --file ../shared/openapi.json
	cd frontend && pnpm exec openapi-typescript ../shared/openapi.json -o lib/api/schema.d.ts
	@echo "SDK güncellendi: frontend/lib/api/schema.d.ts"

test: test-backend test-frontend

test-backend:
	cd backend && . .venv/bin/activate && pytest

test-frontend:
	cd frontend && pnpm test

lint: lint-backend lint-frontend

lint-backend:
	cd backend && . .venv/bin/activate && ruff check . && black --check .

lint-frontend:
	cd frontend && pnpm lint

format:
	cd backend && . .venv/bin/activate && ruff check --fix . && black .
	cd frontend && pnpm format

shell:
	cd backend && . .venv/bin/activate && python manage.py shell

superuser:
	cd backend && . .venv/bin/activate && python manage.py createsuperuser

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	cd frontend && rm -rf .next node_modules/.cache
