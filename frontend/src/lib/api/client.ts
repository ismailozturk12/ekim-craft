/**
 * Backend API fetcher.
 * NOT: OpenAPI schema + openapi-fetch ileride bağlanacak (make gen-sdk).
 * Şimdilik raw fetch + manuel tipler — hızlı iterasyon için.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    next: { revalidate: 30 },
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function health() {
  const res = await fetch(`${API_URL}/health/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Health check failed");
  return (await res.json()) as { status: string; service: string; version: string };
}

// --- Domain tipleri (minimal — backend serializer'la paralel) ---
export interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  count?: number;
  sort_order?: number;
  is_visible?: boolean;
}

export interface ApiProductList {
  id: number;
  slug: string;
  name: string;
  category: number;
  category_slug: string;
  artisan: string;
  artisan_city: string;
  currency: string;
  price: string;
  old_price: string | null;
  rating: string;
  review_count: number;
  tags: string[];
  customizable: boolean;
  size_type: string;
  cover_image: string | null;
  is_visible: boolean;
}

export interface ApiVariant {
  id: number;
  size_label: string;
  color_name: string;
  color_hex: string;
  sku: string;
  stock: number;
  price_delta: string;
  is_active: boolean;
}

export interface ApiProductDetail extends ApiProductList {
  sku: string;
  description: string;
  materials: string[];
  care: string;
  lead_time: string;
  total_stock: number;
  in_stock: boolean;
  images: Array<{ id: number; image: string | null; alt: string; sort_order: number; is_cover: boolean }>;
  variants: ApiVariant[];
  seo_title: string;
  seo_description: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const catalog = {
  listCategories: () => get<ApiCategory[]>("/catalog/categories/"),
  listProducts: (params?: {
    category?: string;
    tag?: string;
    page_size?: number;
    ordering?: string;
    customizable?: boolean;
    on_sale?: boolean;
    min_price?: number;
    max_price?: number;
    search?: string;
    color?: string;
    size?: string;
    brand?: string;
    in_stock?: boolean;
  }) => {
    const qs = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return get<Paginated<ApiProductList>>(`/catalog/products/${qs}`);
  },
  getProduct: (slug: string) => get<ApiProductDetail>(`/catalog/products/${slug}/`),
};

// ------- Returns -------
export type ReturnStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "received"
  | "refunded"
  | "cancelled";
export type ReturnResolution = "refund" | "exchange" | "store_credit";
export type ReturnReason =
  | "wrong_item"
  | "damaged"
  | "not_as_described"
  | "size"
  | "changed_mind"
  | "other";

export interface ApiReturnItem {
  id: number;
  order_item: number;
  product_slug: string;
  name_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  qty: number;
  unit_price: string;
}

export interface ApiReturnListItem {
  id: number;
  number: string;
  order_number: string;
  status: ReturnStatus;
  resolution: ReturnResolution;
  reason: ReturnReason;
  refund_amount: string;
  items_count: number;
  created_at: string;
}

export interface ApiReturnDetail extends ApiReturnListItem {
  order: number;
  user: number | null;
  user_email: string | null;
  customer_note: string;
  admin_note: string;
  return_shipping_label: string;
  tracking_number: string;
  processed_at: string | null;
  items: ApiReturnItem[];
  updated_at: string;
}
