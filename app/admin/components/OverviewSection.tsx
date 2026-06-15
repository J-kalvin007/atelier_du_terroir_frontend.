"use client";

import { useEffect, useState } from "react";
import {
  getAdminCategories,
  getAdminProducts,
  getAdminProductVariants,
  getAdminPromoCodes,
} from "@/lib/ecommerce-api";
import { useAuthSession } from "@/components/auth/useAuthSession";

type OverviewState = {
  products: number;
  categories: number;
  variants: number;
  promoCodes: number;
  error: string | null;
};

export default function OverviewSection() {
  const session = useAuthSession();
  const [state, setState] = useState<OverviewState>({
    products: 0,
    categories: 0,
    variants: 0,
    promoCodes: 0,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!session) return;

    void (async () => {
      try {
        const [products, categories, variants, promoCodes] = await Promise.all([
          getAdminProducts(session.token),
          getAdminCategories(session.token),
          getAdminProductVariants(session.token),
          getAdminPromoCodes(session.token),
        ]);

        if (!active) return;

        setState({
          products: products.length,
          categories: categories.length,
          variants: variants.length,
          promoCodes: promoCodes.length,
          error: null,
        });
      } catch {
        if (!active) return;
        setState((current) => ({
          ...current,
          error: "Impossible de charger les indicateurs admin reels depuis l'API.",
        }));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#e8dece] bg-[linear-gradient(135deg,#fffaf2_0%,#f7ede0_52%,#edf4ef_100%)] p-6 shadow-[0_18px_60px_rgba(66,49,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">Espace admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1e261d]">
          Vue d&apos;ensemble du dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b6756]">
          Structure admin remontee dans `app/admin` comme dans l&apos;ancien projet, avec nos vraies APIs actuelles.
        </p>
      </div>

      {state.error ? (
        <div className="rounded-[1.2rem] border border-[#ead8c3] bg-[#fff7f1] px-4 py-3 text-sm text-[#7b532b]">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard eyebrow="Produits" title={loading ? "..." : String(state.products)} description="Produits admin charges depuis l'API." />
        <MetricCard eyebrow="Categories" title={loading ? "..." : String(state.categories)} description="Categories catalogue disponibles." />
        <MetricCard eyebrow="Variants" title={loading ? "..." : String(state.variants)} description="Variantes produit chargees." />
        <MetricCard eyebrow="Promotions" title={loading ? "..." : String(state.promoCodes)} description="Codes promo admin recuperes." />
      </div>
    </div>
  );
}

function MetricCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[#e8dece] bg-[#fffdf9] p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#1e261d]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#5b6756]">{description}</p>
    </article>
  );
}
