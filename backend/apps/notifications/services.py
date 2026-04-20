"""
Bildirim kanalları — Resend (email), NetGSM (SMS), WhatsApp Cloud.

Tüm adaptörler OutboundMessage'e log bırakır. Celery task'ı
send_queued_messages periyodik drenaj sağlar.
"""

from __future__ import annotations

from typing import Protocol

from django.conf import settings

from .models import MessageTemplate, OutboundMessage


class Channel(Protocol):
    slug: str

    def send(self, to: str, subject: str, body: str, context: dict | None = None) -> str: ...


class ResendEmail:
    slug = "email"

    def __init__(self) -> None:
        self.api_key = getattr(settings, "RESEND_API_KEY", None)

    def send(self, to: str, subject: str, body: str, context: dict | None = None) -> str:
        msg = OutboundMessage.objects.create(
            channel=self.slug,
            to_address=to,
            subject=subject,
            body=body,
            context=context or {},
            status=OutboundMessage.Status.SENT if self.api_key else OutboundMessage.Status.QUEUED,
            provider_reference=f"resend-stub-{OutboundMessage.objects.count() + 1}",
        )
        return str(msg.pk)


class NetgsmSms:
    slug = "sms"

    def __init__(self) -> None:
        self.usercode = getattr(settings, "NETGSM_USERCODE", None)
        self.password = getattr(settings, "NETGSM_PASSWORD", None)
        self.header = getattr(settings, "NETGSM_MSGHEADER", "EKIMCRAFT")

    def send(self, to: str, subject: str, body: str, context: dict | None = None) -> str:
        msg = OutboundMessage.objects.create(
            channel=self.slug,
            to_address=to,
            body=body,
            context=context or {},
            status=OutboundMessage.Status.SENT if self.usercode else OutboundMessage.Status.QUEUED,
            provider_reference=f"netgsm-stub-{OutboundMessage.objects.count() + 1}",
        )
        return str(msg.pk)


class WhatsappCloud:
    slug = "whatsapp"

    def send(self, to: str, subject: str, body: str, context: dict | None = None) -> str:
        msg = OutboundMessage.objects.create(
            channel=self.slug,
            to_address=to,
            body=body,
            context=context or {},
            status=OutboundMessage.Status.QUEUED,
        )
        return str(msg.pk)


CHANNELS: dict[str, type[Channel]] = {
    "email": ResendEmail,
    "sms": NetgsmSms,
    "whatsapp": WhatsappCloud,
}


def notify(event: str, channel: str, to: str, context: dict) -> str | None:
    """Olay bazlı bildirim — şablondan render edip gönderir."""
    try:
        template = MessageTemplate.objects.get(event=event, channel=channel, is_active=True)
    except MessageTemplate.DoesNotExist:
        return None

    # Basit {{var}} substitution
    body = template.body
    subject = template.subject
    for k, v in context.items():
        body = body.replace(f"{{{{{k}}}}}", str(v))
        subject = subject.replace(f"{{{{{k}}}}}", str(v))

    ChannelClass = CHANNELS[channel]
    return ChannelClass().send(to, subject, body, context)
