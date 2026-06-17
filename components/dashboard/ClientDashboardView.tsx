"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Loader2,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import {
  authVegetablesImage,
  legumeImage,
  orangeImage,
  tomateHeroImage,
} from "@/assets/images";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { ClientAccountShell } from "@/components/dashboard/ClientAccountShell";
import {
  formatOrderDate,
  formatOrderStatus,
  getMyLoyaltyProfile,
  getOrders,
  getPublicProducts,
  getWalletBalance,
  type OrderSummary,
  type ProductListItem,
} from "@/lib/ecommerce-api";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const HERO_IMAGES = [authVegetablesImage, tomateHeroImage, orangeImage, legumeImage] as const;

type DashboardStats = {
  orderCount: number;
  recentOrders: OrderSummary[];
  walletBalance: string | null;
  loyaltyPoints: number | null;
  loyaltyTier: string | null;
  products: ProductListItem[];
};

const EMPTY_STATS: DashboardStats = {
  orderCount: 0,
  recentOrders: [],
  walletBalance: null,
  loyaltyPoints: null,
  loyaltyTier: null,
  products: [],
};

export function ClientDashboardView() {
  const session = useAuthSession();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotal());

  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);

  const displayName =
    session?.user.firstName ||
    session?.user.name ||
    session?.user.email?.split("@")[0] ||
    "Client";

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);

      const productsPromise = getPublicProducts(4).catch(() => [] as ProductListItem[]);

      if (!session?.token) {
        const products = await productsPromise;
        if (!cancelled) {
          setStats({ ...EMPTY_STATS, products });
          setLoading(false);
        }
        return;
      }

      const [ordersResult, walletResult, loyaltyResult, products] = await Promise.all([
        getOrders(session.token).catch(() => [] as OrderSummary[]),
        getWalletBalance(session.token).catch(() => null),
        getMyLoyaltyProfile(session.token).catch(() => null),
        productsPromise,
      ]);

      if (cancelled) return;

      setStats({
        orderCount: ordersResult.length,
        recentOrders: ordersResult.slice(0, 3),
        walletBalance: walletResult?.balance ?? null,
        loyaltyPoints: loyaltyResult?.points_balance ?? null,
        loyaltyTier: loyaltyResult?.tier_name ?? null,
        products,
      });
      setLoading(false);
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const recentOrders = stats.recentOrders;

  return (
    <ClientAccountShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-[0_12px_40px_rgba(34,27,18,0.08)]">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e8d9c5] bg-[#fffaf4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5e34]">
                <Sparkles className="h-3 w-3 text-[#ef8219]" />
                Tableau de bord
              </div>

              <h1 className="mt-3 text-lg font-bold text-[#184126] sm:text-xl">
                Bienvenue, {displayName}
              </h1>

              <p className="mt-2 text-xs leading-5 text-[#5c6a59] sm:text-sm">
                Voici un apercu de ton activite : commandes, solde, fidelite et suggestions
                produits.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef8219] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#d97316]"
                >
                  Continuer mes achats
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#eadcca] bg-[#f7f3eb] px-4 py-2.5 text-xs font-semibold text-[#184126] transition hover:bg-[#f5ecdf]"
                >
                  Voir mes commandes
                </Link>
              </div>
            </div>

            <div className="relative min-h-[200px] overflow-hidden sm:min-h-[240px] lg:min-h-[280px]">
              {HERO_IMAGES.map((image, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    opacity: heroIndex === index ? 1 : 0,
                    scale: heroIndex === index ? 1 : 1.04,
                  }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={image}
                    alt="Produits du terroir"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 560px"
                    priority={index === 0}
                  />
                </motion.div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#184126]/55 via-[#184126]/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white">
                  <Leaf className="h-4 w-4 text-[#c2e662]" />
                  <p className="text-xs font-semibold">Produits frais du terroir</p>
                </div>
                <p className="mt-1 text-[11px] text-white/85">
                  Qualite, authenticite et saveurs locales.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            loading={loading}
            icon={Package}
            label="Commandes"
            value={
              session?.token
                ? `${stats.orderCount} commande${stats.orderCount > 1 ? "s" : ""}`
                : "Connecte-toi"
            }
            href="/orders"
          />
          <StatCard
            loading={loading}
            icon={Wallet}
            label="Portefeuille"
            value={
              stats.walletBalance != null
                ? formatCurrency(parseFloat(stats.walletBalance), "FCFA")
                : "—"
            }
            href="/wallet"
          />
          <StatCard
            loading={loading}
            icon={Star}
            label="Fidelite"
            value={
              stats.loyaltyPoints != null
                ? `${stats.loyaltyPoints} pts${stats.loyaltyTier ? ` · ${stats.loyaltyTier}` : ""}`
                : "—"
            }
            href="/loyalty"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <section className="rounded-2xl border border-[#eadcca] bg-white p-4 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#184126]">Dernieres commandes</h2>
              <Link href="/orders" className="text-[11px] font-semibold text-[#ef8219] hover:underline">
                Tout voir
              </Link>
            </div>

            {!session?.token ? (
              <EmptyBlock
                message="Connecte-toi pour voir tes commandes."
                actionHref="/login"
                actionLabel="Se connecter"
              />
            ) : loading ? (
              <LoadingBlock />
            ) : recentOrders.length === 0 ? (
              <EmptyBlock
                message="Aucune commande pour le moment."
                actionHref="/products"
                actionLabel="Parcourir la boutique"
              />
            ) : (
              <ul className="mt-3 space-y-2">
                {recentOrders.map((order) => (
                  <li key={order.reference}>
                    <Link
                      href={`/orders?reference=${encodeURIComponent(order.reference)}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#f0e6d8] bg-[#fffaf4] px-3 py-2.5 transition hover:border-[#ef8219]/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#184126]">
                          {order.reference}
                        </p>
                        <p className="text-[10px] text-[#8b5e34]">
                          {formatOrderDate(order.created_at)} · {formatOrderStatus(order.status)}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-bold text-[#ef8219]">
                        {formatCurrency(parseFloat(order.total_final), "FCFA")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-2xl border border-[#eadcca] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#ef8219]" />
                <h2 className="text-sm font-bold text-[#184126]">Mon panier</h2>
              </div>

              {cartCount === 0 ? (
                <p className="mt-3 text-xs text-[#5c6a59]">Ton panier est vide pour le moment.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {cartItems.slice(0, 3).map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "base"}`}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="truncate text-[#184126]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="shrink-0 font-semibold text-[#8b5e34]">
                        {formatCurrency(parseFloat(item.price) * item.quantity, item.currency)}
                      </span>
                    </div>
                  ))}
                  <p className="border-t border-[#f0e6d8] pt-2 text-xs font-bold text-[#184126]">
                    Total : {formatCurrency(cartTotal, cartItems[0]?.currency ?? "FCFA")}
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ef8219] hover:underline"
              >
                {cartCount > 0 ? "Finaliser ma commande" : "Aller au panier"}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#eadcca] bg-[#fffaf4] p-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#184126]">A decouvrir</h2>
              {loading ? (
                <LoadingBlock compact />
              ) : stats.products.length === 0 ? (
                <p className="mt-2 text-xs text-[#5c6a59]">Aucun produit disponible.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {stats.products.slice(0, 3).map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex items-center gap-2.5 rounded-xl bg-white p-2 transition hover:shadow-sm"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f7f3eb]">
                          {product.primary_image ? (
                            <Image
                              src={product.primary_image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[#8b5e34]">
                              AT
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[#184126]">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-[#ef8219]">
                            {formatCurrency(parseFloat(product.price), product.currency ?? "FCFA")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/products"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ef8219] hover:underline"
              >
                Voir toute la boutique
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </ClientAccountShell>
  );
}

function StatCard({
  loading,
  icon: Icon,
  label,
  value,
  href,
}: {
  loading: boolean;
  icon: typeof Package;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#eadcca] bg-[#fffaf4] px-4 py-3 transition hover:border-[#ef8219]/30 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#ef8219]" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b5e34]">{label}</p>
      </div>
      {loading ? (
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#eadcca]/60" />
      ) : (
        <p className="mt-1.5 text-xs font-semibold text-[#184126]">{value}</p>
      )}
    </Link>
  );
}

function LoadingBlock({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center text-[#8b5e34] ${compact ? "py-4" : "py-8"}`}>
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function EmptyBlock({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="py-6 text-center">
      <p className="text-xs text-[#5c6a59]">{message}</p>
      <Link
        href={actionHref}
        className="mt-3 inline-flex rounded-xl bg-[#ef8219] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#d97316]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
