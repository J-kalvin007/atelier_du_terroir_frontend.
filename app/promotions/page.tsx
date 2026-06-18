"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Loader2, Sparkles, Tag, Zap } from "lucide-react";
import { StorefrontPage } from "@/components/layout/StorefrontPage";
import { PromoCodesGrid } from "@/components/promotions/PromoCodesGrid";
import { PromoProductsCarousel } from "@/components/promotions/PromoProductsCarousel";
import { authVegetablesImage } from "@/assets/images";
import type { PublicFlashSale, PublicPromoCode } from "@/lib/ecommerce-api";
import { getActivePromoCodes, getPromoProducts } from "@/lib/ecommerce-api";
import { mapFlashSalesToPromoCards, type PromoProductCard } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_HERO = authVegetablesImage;

export default function PromotionsPage() {
  const [flashSales, setFlashSales] = useState<PublicFlashSale[]>([]);
  const [promoCards, setPromoCards] = useState<PromoProductCard[]>([]);
  const [promoCodes, setPromoCodes] = useState<PublicPromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [sales, codes] = await Promise.allSettled([
          getPromoProducts(),
          getActivePromoCodes(),
        ]);

        const activeSales = sales.status === "fulfilled" ? sales.value : [];
        setFlashSales(activeSales);
        setPromoCards(mapFlashSalesToPromoCards(activeSales));
        setPromoCodes(codes.status === "fulfilled" ? codes.value : []);
      } catch {
        setFlashSales([]);
        setPromoCards([]);
        setPromoCodes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = flashSales[0] ?? null;
  const heroImage = featured?.product_image || FALLBACK_HERO;
  const heroPrice = featured?.sale_price ?? "5900";
  const heroCompare = featured?.original_price ?? null;
  const heroLink = featured ? `/products/${featured.product_slug}` : "/products";

  return (
    <StorefrontPage mainClassName="min-h-screen bg-[#f9f6ee]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f4d3f] via-[#2f684f] to-[#4f8f58] pt-24 pb-14 text-white sm:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(239,130,25,0.16),transparent_28%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5 text-primary-light" />
                Offres du moment
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[3.2rem]">
                Goutez le meilleur
                <span className="block text-white/90">du terroir</span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-[15px]">
                Des produits agricoles selectionnes avec soin et des ventes flash pour savourer le
                terroir a prix avantageux.
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-black">{formatCurrency(parseFloat(heroPrice), "FCFA")}</p>
                {heroCompare && Number(heroCompare) > Number(heroPrice) ? (
                  <p className="pb-1 text-lg text-white/45 line-through">
                    {formatCurrency(parseFloat(heroCompare), "FCFA")}
                  </p>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={heroLink}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(239,130,25,0.35)] transition hover:bg-primary-hover"
                >
                  Acheter maintenant
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
                >
                  Voir la boutique
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="relative mx-auto w-full max-w-[420px] justify-self-center lg:justify-self-end"
            >
              <div className="absolute -left-6 top-8 h-16 w-16 rotate-[-18deg] opacity-80">
                <Leaf className="h-full w-full text-[#9fd067]" strokeWidth={1.2} />
              </div>
              <div className="absolute -right-4 bottom-10 h-14 w-14 rotate-[24deg] opacity-70">
                <Leaf className="h-full w-full text-[#b8e06a]" strokeWidth={1.2} />
              </div>

              <div className="relative aspect-square overflow-hidden rounded-full border-[6px] border-white/20 bg-white/10 shadow-[0_28px_60px_rgba(0,0,0,0.22)]">
                <Image
                  src={heroImage}
                  alt="Selection de produits du terroir"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 420px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        {loading ? (
          <div className="flex justify-center py-16 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {promoCodes.length > 0 ? (
              <div className="overflow-visible">
                <div className="mb-2">
                  <p className="text-sm leading-7 text-[#5c6a59]">
                    Cliquez sur un code pour l&apos;appliquer directement a votre panier.
                  </p>
                </div>
                <div className="mb-5 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-[#1f241c]">Codes promo</h2>
                </div>
                <PromoCodesGrid promos={promoCodes} />
              </div>
            ) : null}

            <div>
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-[#1f241c]">Produits en promotion</h2>
              </div>

              {promoCards.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-8 text-center text-sm text-[#5c6a59]">
                  Aucune vente flash active pour le moment. Les promotions configurees dans
                  l&apos;administration apparaitront ici automatiquement.
                </p>
              ) : (
                <div className="overflow-visible">
                  <PromoProductsCarousel items={promoCards} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex rounded-full bg-gradient-to-r from-primary to-[#ff9a3c] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-[#d86d14] hover:to-highlight"
          >
            Explorer toute la boutique
          </Link>
        </div>
      </div>
    </StorefrontPage>
  );
}
