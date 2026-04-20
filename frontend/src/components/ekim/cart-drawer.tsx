"use client";

import { Minus, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatTL } from "@/lib/format";
import { cartTotals, useCart } from "@/store/cart";

export function CartDrawer() {
  const { items, isOpen, close, updateQty, removeItem } = useCart();
  const { subtotal, shipping, total, freeShippingDelta } = cartTotals(items);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent
        side="right"
        className="!bg-[var(--ek-bg-elevated)] flex w-full flex-col !gap-0 !p-0 sm:max-w-[460px] shadow-2xl"
      >
        <SheetHeader className="border-ek-line-2 border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="h-3 text-left">Sepetin</SheetTitle>
            <span className="mono">
              {items.length > 0 ? `${items.length} ürün` : "boş"}
            </span>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="bg-ek-cream flex h-20 w-20 items-center justify-center rounded-full text-3xl">
              🛒
            </div>
            <h3 className="h-3">Sepetin boş</h3>
            <p className="text-ek-ink-3 text-sm">Beğendiğin ürünleri buraya eklediğinde gelir.</p>
            <Link
              href="/kategori/all"
              onClick={close}
              className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream mt-2 rounded-full px-6 py-3 text-sm"
            >
              Mağazaya git
            </Link>
          </div>
        ) : (
          <>
            {freeShippingDelta > 0 && (
              <div className="bg-ek-cream text-ek-ink-2 px-5 py-3 text-xs">
                Ücretsiz kargo için <strong>{formatTL(freeShippingDelta)}</strong> daha alışveriş yap.
              </div>
            )}

            <div className="flex-1 divide-y divide-[var(--ek-line-2)] overflow-y-auto px-5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3 py-4">
                  <div className="w-20 shrink-0 overflow-hidden rounded-md">
                    <Placeholder tone={toneForProduct(String(item.productId))} ratio="1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/urun/${item.slug}`}
                      onClick={close}
                      className="hover:text-ek-terra line-clamp-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                    <div className="mono mt-1 flex gap-2">
                      {item.size && <span>{item.size}</span>}
                      {item.color && <span>· {item.color}</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="border-ek-line flex items-center gap-2 rounded-full border">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="hover:bg-ek-bg-elevated flex h-7 w-7 items-center justify-center rounded-full"
                          aria-label="Azalt"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-5 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="hover:bg-ek-bg-elevated flex h-7 w-7 items-center justify-center rounded-full"
                          aria-label="Arttır"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-base">{formatTL(item.price * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-ek-ink-4 hover:text-ek-warn h-fit p-1"
                    aria-label="Kaldır"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-ek-line-2 space-y-2 border-t px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-ek-ink-3">Ara toplam</span>
                <span>{formatTL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ek-ink-3">Kargo</span>
                <span>{shipping === 0 ? "Ücretsiz" : formatTL(shipping)}</span>
              </div>
              <div className="border-ek-line-2 flex justify-between border-t pt-3">
                <span className="font-medium">Toplam</span>
                <span className="font-serif text-xl">{formatTL(total)}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/odeme"
                  onClick={close}
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream rounded-full py-3 text-center text-sm font-medium"
                >
                  Ödemeye geç
                </Link>
                <Link
                  href="/sepet"
                  onClick={close}
                  className="border-ek-line hover:border-ek-ink rounded-full border py-3 text-center text-sm"
                >
                  Sepeti görüntüle
                </Link>
              </div>
              <div className="mono mt-2 flex justify-center gap-4">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
                <span>HAVALE</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={close}
          className="text-ek-ink-3 hover:text-ek-ink absolute right-4 top-4"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>
      </SheetContent>
    </Sheet>
  );
}
