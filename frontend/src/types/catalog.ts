/**
 * Katalog tipleri — design_handoff/data.js + backend gelecek şeması
 * Backend şeması olgunlaştığında `shared/openapi.json`'dan üretilecek.
 */

export type CategorySlug =
  | "oyuncak"
  | "hediyelik"
  | "tablo"
  | "saat"
  | "aksesuar"
  | "dekor"
  | "all";

export type ProductTag = "Yeni" | "Çok satan" | "Sınırlı" | "İndirim" | "Elde yapıldı";

export type SizeType = "one-size" | "apparel" | "numeric-cm" | "paper";

export type OrderStatus = "yeni" | "uretimde" | "kargoda" | "teslim" | "iptal" | "iade";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  count: number;
  description?: string;
  parentId?: string | null;
  imageUrl?: string | null;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  label: string;
  stock: number;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: CategorySlug;
  artisan: string;
  artisanCity: string;
  price: number;
  oldPrice?: number;
  currency: string;
  stock: number;
  rating: number;
  reviews: number;
  tags: ProductTag[];
  customizable: boolean;
  sizeType: SizeType;
  sizes: ProductSize[];
  colors: ProductColor[];
  desc: string;
  materials: string[];
  care: string;
  leadTime: string;
  images?: string[];
  coverImage?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  user: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verified: boolean;
  helpful: number;
  photos?: string[];
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line: string;
  city: string;
  phone: string;
  default: boolean;
}

export interface OrderItem {
  pid: string;
  name: string;
  qty: number;
  size: string;
  price: number;
  custom?: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  tracking?: string;
}

export interface Personalization {
  image?: { url: string; name?: string };
  text?: { content: string; font: string; color: string };
  note?: string;
  customSize?: { w: number; h: number; d: number };
  giftWrap?: boolean;
}

export interface CartItem {
  productId: string;
  variantKey: string; // size + color
  size: string;
  color: string;
  qty: number;
  personalization?: Personalization;
  addedAt: number;
}
