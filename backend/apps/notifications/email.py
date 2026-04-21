"""
Uygulamanın işlem e-postaları için tek kaynak.

Kullanım:
    from apps.notifications.email import send_email
    send_email("welcome", to="ada@example.com", ctx={...})

Şu anda plain-text gönderim; şablonlar string olarak burada tutulur.
İleride MJML/HTML şablonlara geçildiğinde TEMPLATES dict'i değişir.
"""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


# ---- metin şablonları --------------------------------------------------------

TEMPLATES: dict[str, dict[str, str]] = {
    "welcome": {
        "subject": "Hoş geldin — Ekim Craft",
        "body": (
            "Merhaba {first_name},\n\n"
            "Ekim Craft'a hoş geldin! Hesabın oluşturuldu. "
            "El yapımı, kişiye özel ürünlerimizi keşfetmek için mağazamıza göz atabilirsin:\n"
            "{site_url}/kategori/all\n\n"
            "Her sorunun için {support_email} adresinden bize ulaşabilirsin.\n\n"
            "— Ekim Craft ekibi"
        ),
    },
    "order_placed": {
        "subject": "Siparişin alındı · {order_number}",
        "body": (
            "Merhaba {recipient_name},\n\n"
            "Siparişin alındı, teşekkürler! 🧡\n\n"
            "Sipariş numarası: {order_number}\n"
            "Toplam: {total} ₺\n"
            "Ödeme: {payment_method}\n"
            "Teslimat: {shipping_method}\n\n"
            "Sipariş detayı:\n"
            "{items_summary}\n\n"
            "Siparişini takip etmek için:\n"
            "{site_url}/siparis-basarili/{order_number}\n\n"
            "El yapımı üretim sürecimizdeki adımlar:\n"
            "1. Ödeme onayı\n"
            "2. Atölyede hazırlık (1-5 iş günü)\n"
            "3. Kargoya teslim\n"
            "4. Kapına ulaşım\n\n"
            "Her sorunun için {support_email} adresinden bize ulaşabilirsin.\n\n"
            "— Ekim Craft"
        ),
    },
    "order_shipped": {
        "subject": "Kargoya verildi · {order_number}",
        "body": (
            "Merhaba {recipient_name},\n\n"
            "{order_number} numaralı siparişin kargoya verildi.\n\n"
            "Kargo firması: {carrier}\n"
            "Takip numarası: {tracking_number}\n\n"
            "1-3 iş günü içinde elinde olur.\n\n"
            "— Ekim Craft"
        ),
    },
    "password_reset": {
        "subject": "Şifreni sıfırla — Ekim Craft",
        "body": (
            "Merhaba,\n\n"
            "Şifreni sıfırlamak için aşağıdaki bağlantıyı kullan:\n\n"
            "{reset_url}\n\n"
            "Bağlantı 1 saat geçerlidir. Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.\n\n"
            "— Ekim Craft"
        ),
    },
}


def send_email(template: str, to: str | list[str], ctx: dict | None = None) -> bool:
    """Şablon ile e-posta gönder. Başarısızlıkta False döner (atmaz), log'a düşürür."""
    ctx = dict(ctx or {})
    ctx.setdefault("site_url", getattr(settings, "SITE_URL", "https://ekimcraft.com"))
    ctx.setdefault("support_email", getattr(settings, "SUPPORT_EMAIL", "destek@ekimcraft.com"))

    tpl = TEMPLATES.get(template)
    if not tpl:
        logger.error("Email template '%s' bulunamadı", template)
        return False

    try:
        subject = tpl["subject"].format(**ctx)
        body = tpl["body"].format(**ctx)
    except KeyError as e:
        logger.error("Email şablon ctx eksik (%s): %s", template, e)
        return False

    recipients = to if isinstance(to, list) else [to]
    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            reply_to=[getattr(settings, "SUPPORT_EMAIL", "destek@ekimcraft.com")],
        )
        msg.send(fail_silently=False)
        logger.info("Email gönderildi (%s) → %s", template, recipients)
        return True
    except Exception as exc:
        # SMTP yapılandırılmamışsa sessizce düşme ama uyar
        logger.warning("Email gönderilemedi (%s) → %s: %s", template, recipients, exc)
        return False
