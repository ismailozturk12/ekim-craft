"use client";

import { AlertCircle, CheckCircle2, Loader2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch, useAuth } from "@/store/auth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSlug: string;
  productName: string;
  onSuccess?: () => void;
}

const RATING_COPY: Array<{ label: string; color: string; bg: string; emoji: string }> = [
  { label: "Çok kötü", color: "text-ek-warn", bg: "bg-ek-warn/10", emoji: "😞" },
  { label: "Kötü", color: "text-ek-warn", bg: "bg-ek-warn/10", emoji: "😕" },
  { label: "Orta", color: "text-ek-ink-2", bg: "bg-ek-bg", emoji: "😐" },
  { label: "İyi", color: "text-ek-forest", bg: "bg-ek-sage/20", emoji: "🙂" },
  { label: "Mükemmel", color: "text-ek-ok", bg: "bg-ek-ok/10", emoji: "🤩" },
];

const MIN_BODY = 10;
const MAX_BODY = 1000;
const MAX_TITLE = 120;

export function WriteReviewDialog({
  open,
  onOpenChange,
  productSlug,
  productName,
  onSuccess,
}: Props) {
  const user = useAuth((s) => s.user);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setTitle("");
      setBody("");
      setRecommend(null);
      setTouched(false);
    }
  }, [open]);

  const activeRating = hover || rating;
  const copy = activeRating > 0 ? RATING_COPY[activeRating - 1] : null;

  const bodyLen = body.trim().length;
  const ratingValid = rating >= 1 && rating <= 5;
  const bodyValid = bodyLen >= MIN_BODY;
  const canSubmit = ratingValid && bodyValid && !submitting;

  const submit = async () => {
    setTouched(true);
    if (!user) {
      toast.error("Yorum için giriş yap");
      return;
    }
    if (!ratingValid) {
      toast.error("Puan seç");
      return;
    }
    if (!bodyValid) {
      toast.error(`Yorum en az ${MIN_BODY} karakter olmalı`);
      return;
    }
    setSubmitting(true);
    try {
      const bodySuffix =
        recommend === false
          ? "\n\n— Arkadaşıma önermem."
          : recommend === true
            ? "\n\n— Arkadaşıma öneririm."
            : "";
      const res = await authedFetch(`/catalog/products/${productSlug}/reviews/`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          title: title.trim(),
          body: body.trim() + bodySuffix,
        }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("Yorumun yayımlandı, teşekkürler!");
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!bg-[var(--ek-bg-elevated)] flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden border-0 p-0 !gap-0 shadow-2xl sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Yorum yaz</DialogTitle>

        <header className="border-ek-line-2 border-b px-5 py-4 sm:px-6">
          <div className="eyebrow">ÜRÜNÜN İÇİN PUAN VER</div>
          <h2 className="h-3 mt-1 truncate">{productName}</h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {/* Rating picker */}
            <section>
              <div className="label mb-3">Puan *</div>
              <div
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors",
                  copy ? `${copy.bg} border-transparent` : "border-ek-line bg-ek-bg",
                )}
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${i} yıldız`}
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          i <= activeRating
                            ? "fill-ek-terra text-ek-terra"
                            : "text-ek-line stroke-[1.5]",
                        )}
                      />
                    </button>
                  ))}
                </div>
                {copy ? (
                  <div className={cn("flex items-center gap-2 text-sm font-medium", copy.color)}>
                    <span className="text-lg">{copy.emoji}</span>
                    <span>{copy.label}</span>
                    <span className="text-ek-ink-3 font-normal">· {activeRating}/5</span>
                  </div>
                ) : (
                  <div className="text-ek-ink-3 text-xs">Bir yıldıza tıkla</div>
                )}
              </div>
              {touched && !ratingValid && (
                <div className="text-ek-warn mt-1.5 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> Puan seçmelisin
                </div>
              )}
            </section>

            {/* Recommend toggle */}
            <section>
              <div className="label mb-2">Arkadaşına önerir misin?</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm transition-colors",
                    recommend === true
                      ? "bg-ek-ok/10 border-ek-ok text-ek-ok"
                      : "border-ek-line bg-ek-bg hover:border-ek-ink-3",
                  )}
                >
                  <ThumbsUp size={14} />
                  Evet
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm transition-colors",
                    recommend === false
                      ? "bg-ek-warn/10 border-ek-warn text-ek-warn"
                      : "border-ek-line bg-ek-bg hover:border-ek-ink-3",
                  )}
                >
                  <ThumbsDown size={14} />
                  Hayır
                </button>
              </div>
            </section>

            {/* Title */}
            <section>
              <div className="label mb-2 flex items-center justify-between">
                <span>Başlık (opsiyonel)</span>
                <span className="text-ek-ink-3 font-normal normal-case">
                  {title.length}/{MAX_TITLE}
                </span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                placeholder={
                  activeRating >= 4
                    ? "Harika oldu, teşekkürler!"
                    : activeRating > 0 && activeRating <= 2
                      ? "Beklediğim gibi değildi"
                      : "Yorumunu bir cümleyle özetle"
                }
                className="border-ek-line bg-ek-bg focus:border-ek-forest placeholder:text-ek-ink-4 w-full rounded-md border px-3 py-2.5 text-sm outline-none"
              />
            </section>

            {/* Body */}
            <section>
              <div className="label mb-2 flex items-center justify-between">
                <span>Yorumun *</span>
                <span
                  className={cn(
                    "font-normal normal-case",
                    bodyLen < MIN_BODY
                      ? "text-ek-ink-4"
                      : bodyLen > MAX_BODY
                        ? "text-ek-warn"
                        : "text-ek-ink-3",
                  )}
                >
                  {bodyLen} / {MAX_BODY}
                </span>
              </div>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  activeRating >= 4
                    ? "Ürünün neyini beğendin? İşçilik, paket, zamanlama hakkında paylaş."
                    : activeRating > 0 && activeRating <= 2
                      ? "Nerede eksik kaldı? Üretimi geliştirmek için geri bildirimin çok değerli."
                      : "Ürün senin için nasıldı? İşçilik, kalite, paket, zamanlama..."
                }
                className="border-ek-line bg-ek-bg focus:border-ek-forest placeholder:text-ek-ink-4 w-full resize-none rounded-md border px-3 py-2.5 text-sm outline-none"
                maxLength={MAX_BODY}
              />
              {touched && !bodyValid && bodyLen < MIN_BODY && (
                <div className="text-ek-warn mt-1.5 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> En az {MIN_BODY} karakter yaz ({MIN_BODY - bodyLen} daha)
                </div>
              )}
              {bodyValid && (
                <div className="text-ek-ok mt-1.5 flex items-center gap-1 text-xs">
                  <CheckCircle2 size={12} /> Hazır
                </div>
              )}
            </section>

            {/* Guidance */}
            <div className="border-ek-line-2 bg-ek-bg text-ek-ink-3 rounded-md border border-dashed p-3 text-[11px] leading-relaxed">
              <strong className="text-ek-ink-2">İpucu:</strong> Yorumun onaylanınca ürünün altında
              görüntülenecek. Kişisel bilgi ve küfür paylaşma; mahremiyetini koru.
            </div>
          </div>
        </div>

        <footer className="border-ek-line-2 bg-ek-bg-elevated flex gap-2 border-t px-5 py-4 sm:px-6">
          <button
            onClick={() => onOpenChange(false)}
            type="button"
            className="border-ek-line hover:border-ek-ink-3 flex-1 rounded-full border py-2.5 text-sm"
          >
            Vazgeç
          </button>
          <button
            onClick={submit}
            type="button"
            disabled={!canSubmit}
            className="bg-ek-ink text-ek-cream hover:bg-ek-forest flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Yorumu yayınla
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
