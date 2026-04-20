"""Güvenlik middleware'i — rate limit + security headers.

Faz 12 için iskelet. Prod'da django-ratelimit veya django-axes eklenir.
"""

from __future__ import annotations

from collections import defaultdict
from time import time
from typing import Callable

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse


class SecurityHeadersMiddleware:
    """Ek security header'lar (nginx/Vercel de koyabilir)."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        if not settings.DEBUG:
            response["X-Content-Type-Options"] = "nosniff"
            response["X-Frame-Options"] = "DENY"
            response["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response["Permissions-Policy"] = (
                "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(self)"
            )
        return response


class SimpleRateLimit:
    """IP bazlı kaba rate limit — prod'da Redis kullan. DEBUG modda bypass."""

    WINDOW_SEC = 60
    MAX_REQ = 1200

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self._buckets: dict[str, list[float]] = defaultdict(list)

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if settings.DEBUG:
            return self.get_response(request)
        ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0] or request.META.get("REMOTE_ADDR", "")
        now = time()
        bucket = self._buckets[ip]
        bucket[:] = [t for t in bucket if now - t < self.WINDOW_SEC]
        if len(bucket) > self.MAX_REQ:
            return JsonResponse({"detail": "Çok fazla istek. Biraz bekle."}, status=429)
        bucket.append(now)
        return self.get_response(request)
