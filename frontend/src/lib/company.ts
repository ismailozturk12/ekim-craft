/**
 * Şirket iletişim ve yasal bilgileri — tek kaynak.
 *
 * Gerçek değerleri `.env.production` veya `.env.local` dosyasında set et:
 *   NEXT_PUBLIC_COMPANY_NAME=Ekim Craft Atölye
 *   NEXT_PUBLIC_COMPANY_PHONE=0850 ...
 *   NEXT_PUBLIC_COMPANY_EMAIL=destek@...
 *   NEXT_PUBLIC_COMPANY_ADDRESS=Atölye adresi...
 *   NEXT_PUBLIC_COMPANY_DISTRICT=Kadıköy, İstanbul
 *   NEXT_PUBLIC_COMPANY_MAP_BBOX=29.025,40.987,29.035,40.993
 *   NEXT_PUBLIC_COMPANY_TAX_NO=...
 *   NEXT_PUBLIC_COMPANY_MERSIS=...
 *   NEXT_PUBLIC_COMPANY_KVKK_EMAIL=kvkk@...
 *
 * Env'de yoksa fallback olarak boş döner ve UI'da bölüm gizlenir.
 */

export const company = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Ekim Craft",
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "Ekim Craft Atölye",

  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
  phoneHours: process.env.NEXT_PUBLIC_COMPANY_PHONE_HOURS || "09:00-18:00 (hafta içi)",

  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "destek@ekimcraft.com",
  kvkkEmail: process.env.NEXT_PUBLIC_COMPANY_KVKK_EMAIL || "kvkk@ekimcraft.com",

  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
  district: process.env.NEXT_PUBLIC_COMPANY_DISTRICT || "",
  mapBbox: process.env.NEXT_PUBLIC_COMPANY_MAP_BBOX || "",

  taxNo: process.env.NEXT_PUBLIC_COMPANY_TAX_NO || "",
  mersis: process.env.NEXT_PUBLIC_COMPANY_MERSIS || "",

  // Sayfalar için "son güncelleme" tarihleri
  legalUpdated: process.env.NEXT_PUBLIC_LEGAL_UPDATED || "Nisan 2026",

  // Footer sosyal medya (boşsa gizlenir)
  instagram: process.env.NEXT_PUBLIC_COMPANY_INSTAGRAM || "",
  twitter: process.env.NEXT_PUBLIC_COMPANY_TWITTER || "",
} as const;

export function hasAddress(): boolean {
  return !!company.address.trim();
}

export function hasPhone(): boolean {
  return !!company.phone.trim();
}

export function fullAddress(): string {
  return [company.address, company.district].filter(Boolean).join(", ");
}
