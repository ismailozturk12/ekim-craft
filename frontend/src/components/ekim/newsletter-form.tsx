"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Geçerli bir e-posta gir");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/core/newsletter/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      setSent(true);
      setEmail("");
      toast.success("Abone oldun, teşekkürler!");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-ek-cream/10 text-ek-cream/90 mt-6 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm">
        <Check size={14} className="text-ek-terra" />
        Aboneliğin aktif — her ay en güzel parçalar gelecek.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresin"
        className="border-ek-cream/20 bg-ek-cream/10 placeholder:text-ek-cream/40 text-ek-cream flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
      />
      <button
        disabled={sending}
        className="bg-ek-terra hover:bg-ek-terra-2 rounded-full px-5 text-sm font-medium text-white transition-colors disabled:opacity-60"
      >
        {sending ? "..." : "Abone ol"}
      </button>
    </form>
  );
}
