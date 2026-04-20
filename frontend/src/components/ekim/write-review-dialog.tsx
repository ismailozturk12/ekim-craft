"use client";

import { Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch, useAuth } from "@/store/auth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSlug: string;
  productName: string;
  onSuccess?: () => void;
}

export function WriteReviewDialog({ open, onOpenChange, productSlug, productName, onSuccess }: Props) {
  const user = useAuth((s) => s.user);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast.error("Yorum için giriş yap");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Yorum en az 10 karakter olmalı");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authedFetch(`/catalog/products/${productSlug}/reviews/`, {
        method: "POST",
        body: JSON.stringify({ rating, title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("Yorumun eklendi, teşekkürler!");
      setRating(5);
      setTitle("");
      setBody("");
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ek-bg-elevated max-w-md p-0">
        <header className="border-ek-line-2 flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="h-3">Yorum yaz</h3>
            <div className="mono mt-0.5 truncate">{productName}</div>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-ek-ink-3 hover:text-ek-ink">
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div>
            <label className="eyebrow mb-2 block">PUAN</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5"
                  aria-label={`${i} yıldız`}
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      i <= (hover || rating)
                        ? "fill-ek-terra text-ek-terra"
                        : "text-ek-line"
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              <span className="text-ek-ink-3 ml-2 self-center text-sm">
                {hover || rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="eyebrow mb-2 block">BAŞLIK (opsiyonel)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Harika oldu"
              maxLength={200}
              className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="eyebrow mb-2 block">YORUMUN</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ürün senin için nasıldı? İşçilik, kalite, paket, zamanlama hakkında paylaş."
              className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none"
            />
            <div className="mono mt-1 text-right">{body.length}/500</div>
          </div>
        </div>

        <footer className="border-ek-line-2 flex gap-2 border-t p-4">
          <button
            onClick={() => onOpenChange(false)}
            className="border-ek-line flex-1 rounded-full border py-2 text-sm"
          >
            İptal
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-ek-forest text-ek-cream flex-1 rounded-full py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "Gönderiliyor..." : "Yorumu yayınla"}
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
