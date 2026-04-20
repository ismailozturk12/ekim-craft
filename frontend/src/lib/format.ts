/**
 * Türkçe format yardımcıları — tasarım handoff'tan alındı.
 */

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(n);
}

/** Türk lirası formatı: 540 → "540 ₺" */
export function formatTL(n: number): string {
  return `${formatNumber(n)} ₺`;
}

/** İndirim yüzdesi hesapla */
export function discountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Yıldız ortalamasını renklendirilebilir değere dönüştür */
export function formatRating(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

/** Tarih: "20 Nis 2026" */
const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function formatDateShort(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}

/** Göreceli zaman: "3 saat önce" */
export function timeAgo(input: string | Date | number): string {
  const now = Date.now();
  const then = typeof input === "number" ? input : new Date(input).getTime();
  const s = Math.max(0, (now - then) / 1000);
  if (s < 60) return "şimdi";
  if (s < 3600) return `${Math.floor(s / 60)}dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`;
  if (s < 604800) return `${Math.floor(s / 86400)}g önce`;
  if (s < 2592000) return `${Math.floor(s / 604800)}h önce`;
  return formatDateShort(new Date(then));
}
