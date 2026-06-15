"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { checkoutOrder } from "@/lib/ecommerce-api";
import { readApiError } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import { LegacyFooter } from "@/components/home/LegacyFooter";

export default function CheckoutPage() {
  const router = useRouter();
  const session = useAuthSession();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    address_livraison: "",
    phone_livraison: "",
    city: "",
    country: "Senegal",
    notes: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await checkoutOrder(session.token, {
        ...form,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      if (order.reference) {
        router.push(`/client?order=${order.reference}`);
      } else {
        router.push("/products?checkout=success");
      }
    } catch (err) {
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
          Validation via `/api/v1/commandes/validate-commandes/`
        </p>
          </div>

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
              {items.length} article(s) — Total: {getTotal().toLocaleString("fr-FR")} FCFA
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
                disabled={loading || items.length === 0}
                className="rounded-2xl bg-[#8b5e34] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Traitement..." : "Confirmer la commande"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <LegacyFooter />
    </>
  );
}
