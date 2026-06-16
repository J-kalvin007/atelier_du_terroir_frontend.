"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAdminCategories,
  getAdminProducts,
  getAdminProductVariants,
  getAdminPromoCodes,
  getPublicCategories,
  type AdminProductVariant,
} from "@/lib/ecommerce-api";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { hasAdminAccess } from "@/lib/auth";

type OverviewState = {
  products: number;
  categories: number;
  variants: number;
  promoCodes: number;
  error: string | null;
};

export default function OverviewSection() {
  const session = useAuthSession();
  const isAdmin = hasAdminAccess(session);
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

    void (async () => {
      try {
        const [products, categories, variants, promoCodes] = await Promise.all([
          getAdminProducts(session?.token),
          session?.token ? getAdminCategories(session.token) : getPublicCategories().then((items) =>
            items.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              image: category.image,
              children: category.children ?? null,
            }))
          ),
          session?.token
            ? getAdminProductVariants(session.token).catch(() => [] as AdminProductVariant[])
            : Promise.resolve([] as AdminProductVariant[]),
          session?.token
            ? getAdminPromoCodes(session.token).catch(() => [])
            : Promise.resolve([]),
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
  }, [session?.token]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#e8dece] bg-[linear-gradient(135deg,#fffaf2_0%,#f7ede0_52%,#edf4ef_100%)] p-6 shadow-[0_18px_60px_rgba(66,49,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">Espace admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1e261d]">
          Vue d&apos;ensemble du dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b6756]">
          Gere produits, commandes, clients et promotions. Utilise le menu lateral ou les raccourcis
          ci-dessous. L&apos;espace client (boutique) reste accessible sans te deconnecter.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <QuickLink href="/admin?section=products" label="Ajouter un produit" />
          <QuickLink href="/admin?section=categories" label="Categories" />
          <QuickLink href="/admin?section=orders" label="Commandes" />
          <QuickLink href="/" label="Voir la boutique" />
        </div>
        {isAdmin ? (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Session admin detectee — acces CRUD actif
          </p>
        ) : null}
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

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-[#d8c4ab] bg-white/80 px-4 py-2 text-sm font-semibold text-[#1f4d3f] transition hover:border-[#8b5e34] hover:text-[#8b5e34]"
    >
      {label}
    </Link>
  );
}
