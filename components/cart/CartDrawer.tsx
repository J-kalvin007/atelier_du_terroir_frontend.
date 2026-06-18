"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { isFreeShippingPromoType } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";
import { CheckoutTotalsSummary } from "@/components/promotions/CheckoutTotalsSummary";
import { useApplyPromoCode } from "@/hooks/useApplyPromoCode";
import { useCartStore } from "@/store/cartStore";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    toggleDrawer,
    updateQuantity,
    removeItem,
    getTotal,
    getSubtotal,
    getShippingFee,
    getShippingCharged,
    getItemCount,
    promoDiscount,
    promoLabel,
    promoType,
    setPromoCode,
  } = useCartStore();
  const { revalidateActiveCode } = useApplyPromoCode();
  const promoCode = useCartStore((state) => state.promoCode);
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen || !promoCode) {
      return;
    }
    void revalidateActiveCode();
  }, [isDrawerOpen, items, promoCode, revalidateActiveCode]);

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => toggleDrawer(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-[#fffaf5] shadow-2xl sm:w-[420px]"
          >
            <div className="flex items-center justify-between border-b border-[#eadfce] px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#8b5e34]" />
                <h2 className="text-lg font-bold text-[#1f241c]">Mon panier</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b5e34] text-xs font-bold text-white">
                  {itemCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleDrawer(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f3ede2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f3ede2]">
                    <ShoppingBag className="h-10 w-10 text-[#8b5e34]/40" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#1f241c]">Votre panier est vide</p>
                    <p className="mt-1 text-sm text-[#5d6b58]">Ajoutez des produits pour commencer</p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => toggleDrawer(false)}
                    className="rounded-full bg-[#1f4d3f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173a30]"
                  >
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "default"}`}
                      className="flex gap-3 rounded-2xl border border-[#e8dece] bg-white p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3ede2]">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#8b5e34]">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => toggleDrawer(false)}
                          className="line-clamp-2 text-sm font-semibold text-[#1f241c] hover:text-[#8b5e34]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm font-bold text-[#1f4d3f]">
                          {formatCurrency(item.price, item.currency)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-[#e8dece]">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center hover:bg-[#f3ede2]"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center hover:bg-[#f3ede2]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="rounded-lg p-2 text-[#8a9086] hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-[#eadfce] px-6 py-5">
                {(promoDiscount > 0 || isFreeShippingPromoType(promoType)) && promoCode ? (
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
                    <span className="font-semibold text-emerald-800">
                      {isFreeShippingPromoType(promoType)
                        ? "Livraison offerte appliquee"
                        : `Reduction ${promoLabel ? `(${promoLabel})` : ""} appliquee`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPromoCode(null, 0, null, null)}
                      className="text-xs font-medium text-[#8a9086] hover:text-red-500"
                    >
                      Retirer
                    </button>
                  </div>
                ) : null}

                <CheckoutTotalsSummary
                  subtotal={subtotal}
                  shippingFee={getShippingFee()}
                  shippingCharged={getShippingCharged()}
                  discount={promoDiscount}
                  total={total}
                  promoType={promoType}
                  reductionLabel={promoLabel ? `Reduction (${promoLabel})` : "Reduction promo"}
                  className="mb-4"
                />
                <Link
                  href="/checkout"
                  onClick={() => toggleDrawer(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8b5e34] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#744b27]"
                >
                  Commander
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
