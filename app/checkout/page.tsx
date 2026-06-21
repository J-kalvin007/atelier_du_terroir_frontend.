"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { clearSession } from "@/lib/auth";
import { checkoutOrder } from "@/lib/ecommerce-api";
import { resolveCartItemsForCheckout, hasResolvableCartItem } from "@/lib/cart-checkout";
import { appendOrderPromoMeta, saveOrderPromoSnapshot } from "@/lib/order-promo-meta";
import { useApplyPromoCode } from "@/hooks/useApplyPromoCode";
import { CheckoutTotalsSummary } from "@/components/promotions/CheckoutTotalsSummary";
import { formatCurrency, isInvalidAuthTokenError, readApiError } from "@/lib/utils";
import { isFreeShippingPromoType } from "@/lib/shipping";
import { useCartStore } from "@/store/cartStore";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import { LegacyFooter } from "@/components/home/LegacyFooter";

function getCheckoutBlockReason(options: {
  cartHydrated: boolean;
  loading: boolean;
  hasSession: boolean;
  itemsCount: number;
  invalidCartItemsCount: number;
}) {
  if (!options.cartHydrated) {
    return "Chargement du panier...";
  }

  if (options.loading) {
    return "Traitement de la commande...";
  }

  if (!options.hasSession) {
    return "Connectez-vous pour confirmer la commande.";
  }

  if (options.itemsCount === 0) {
    return "Votre panier est vide.";
  }

  if (options.invalidCartItemsCount > 0) {
    return "Certains articles du panier sont invalides. Retirez-les puis rajoutez les produits depuis la boutique.";
  }

  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const session = useAuthSession();
  const { revalidateActiveCode } = useApplyPromoCode();
  const { items, getTotal, getSubtotal, getShippingFee, getShippingCharged, clearCart, hasHydrated, promoCode, promoDiscount, promoLabel, promoType, promoValue } =
    useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removedInvalidItems, setRemovedInvalidItems] = useState(0);
  const [form, setForm] = useState({
    address_livraison: "",
    phone_livraison: "",
    city: "",
    country: "Senegal",
    notes: "",
  });

  const invalidCartItems = items.filter((item) => !hasResolvableCartItem(item));

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const currentItems = useCartStore.getState().items;
    const validItems = currentItems.filter((item) => hasResolvableCartItem(item));
    const removedCount = currentItems.length - validItems.length;

    if (removedCount > 0) {
      useCartStore.setState({ items: validItems });
      setRemovedInvalidItems(removedCount);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !promoCode || items.length === 0) {
      return;
    }
    void revalidateActiveCode();
  }, [hasHydrated, items, promoCode, revalidateActiveCode]);

  const blockReason = useMemo(
    () =>
      getCheckoutBlockReason({
        cartHydrated: hasHydrated,
        loading,
        hasSession: Boolean(session?.token),
        itemsCount: items.length,
        invalidCartItemsCount: invalidCartItems.length,
      }),
    [hasHydrated, loading, session?.token, items.length, invalidCartItems.length]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (blockReason) {
      setError(blockReason);
      return;
    }

    if (!session?.token) {
      router.push("/login?redirect=/checkout&reason=session-expired");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutItems = await resolveCartItemsForCheckout(items);

      const hasPromo =
        Boolean(promoCode) &&
        (promoDiscount > 0 || isFreeShippingPromoType(promoType));
      const notesWithPromo = hasPromo
          ? appendOrderPromoMeta(form.notes, {
              code: promoCode!,
              discount: promoDiscount,
              type: promoType ?? undefined,
              value: promoValue ?? undefined,
              label: promoLabel ?? undefined,
            })
          : form.notes;

      const order = await checkoutOrder(session.token, {
        ...form,
        notes: notesWithPromo,
        promo_code: promoCode,
        promo_discount: promoDiscount,
        promo_label: promoLabel,
        promo_type: promoType,
        promo_value: promoValue,
        free_shipping: isFreeShippingPromoType(promoType),
        shipping_fee: getShippingFee(),
        items: checkoutItems,
      });

      if (order.reference && hasPromo) {
        saveOrderPromoSnapshot(order.reference, {
          code: promoCode!,
          discount: promoDiscount,
          type: promoType ?? undefined,
          value: promoValue ?? undefined,
          label: promoLabel ?? undefined,
        });
      }

      clearCart();
      router.push(
        order.reference
          ? `/orders?reference=${encodeURIComponent(order.reference)}`
          : "/orders?checkout=success"
      );
    } catch (err) {
      if (isInvalidAuthTokenError(err)) {
        clearSession();
        setError("Votre session a expire. Reconnectez-vous pour confirmer la commande.");
        return;
      }
      setError(readApiError(err, "Impossible de finaliser la commande."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LegacyHeader />
      <main className="min-h-screen bg-[#f6f1e8] px-6 pb-16 pt-28 text-[#1f241c]">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Finaliser la commande</h1>
            <p className="mt-2 text-sm text-[#5d6b58]">
              Renseignez votre adresse de livraison pour confirmer la commande.
            </p>
          </div>

          {!session?.token ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Link href="/login?redirect=/checkout" className="font-semibold underline">
                Connectez-vous
              </Link>{" "}
              pour confirmer votre commande.
            </div>
          ) : null}

          {removedInvalidItems > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {removedInvalidItems} article(s) obsolete(s) ont ete retires du panier. Rajoutez les
              produits depuis{" "}
              <Link href="/products" className="font-semibold underline">
                la boutique
              </Link>
              .
            </div>
          ) : null}

          {invalidCartItems.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {invalidCartItems.length} article(s) du panier ont un identifiant invalide.{" "}
              <button type="button" onClick={() => clearCart()} className="font-semibold underline">
                Vider le panier
              </button>{" "}
              puis ajoutez les produits depuis{" "}
              <Link href="/products" className="font-semibold underline">
                la boutique
              </Link>
              .
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-[#e7d7c1] bg-white p-8">
            {[
              ["address_livraison", "Adresse de livraison"],
              ["phone_livraison", "Telephone"],
              ["city", "Ville"],
              ["country", "Pays"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
                  {label}
                </label>
                <input
                  required
                  value={form[field as keyof typeof form]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                  className="h-11 w-full rounded-2xl border border-[#e7d7c1] px-4 text-sm outline-none focus:border-[#8b5e34]"
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
                Notes
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="w-full rounded-2xl border border-[#e7d7c1] px-4 py-3 text-sm outline-none focus:border-[#8b5e34]"
              />
            </div>

            <div className="rounded-2xl bg-[#fbf5ed] px-4 py-3 text-sm">
              {!hasHydrated ? (
                "Chargement du panier..."
              ) : (
                <CheckoutTotalsSummary
                  subtotal={getSubtotal()}
                  shippingFee={getShippingFee()}
                  shippingCharged={getShippingCharged()}
                  discount={promoDiscount}
                  total={getTotal()}
                  promoType={promoType}
                  reductionLabel={promoLabel ? `Reduction (${promoLabel})` : "Reduction promo"}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl border border-[#d8c4ab] px-5 py-3 text-sm font-semibold text-[#1f4d3f]"
              >
                Continuer mes achats
              </Link>
              <button
                type="submit"
                disabled={loading || !hasHydrated}
                aria-disabled={Boolean(blockReason) || loading || !hasHydrated}
                className="rounded-2xl bg-[#8b5e34] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Traitement..." : "Confirmer la commande"}
              </button>
            </div>

            {blockReason ? (
              <p className="text-sm text-[#8b5e34]">{blockReason}</p>
            ) : null}
          </form>
        </div>
      </main>
      <LegacyFooter />
    </>
  );
}
