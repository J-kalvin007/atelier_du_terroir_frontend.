"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { PromoProductsCarousel } from "@/components/promotions/PromoProductsCarousel";
import {
  getActiveBanners,
  getPromoProducts,
  type PublicBanner,
} from "@/lib/ecommerce-api";
import { mapFlashSalesToPromoCards, type PromoProductCard } from "@/lib/promotions";

function PromoBanner({ banner }: { banner: PublicBanner }) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-[#1f4d3f] shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
      {banner.image_url ? (
        <div className="relative h-44 sm:h-52">
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f4d3f]/90 via-[#1f4d3f]/60 to-transparent" />
        </div>
      ) : null}
      <div className={`${banner.image_url ? "absolute inset-0 flex items-center" : "p-8"}`}>
        <div className="max-w-xl px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {banner.subtitle || "Offre speciale"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{banner.title}</h3>
          {banner.cta_label ? (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-semibold text-white">
              {banner.cta_label}
              <ArrowRight className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (banner.cta_url) {
    return (
      <Link href={banner.cta_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function HomePromotionsSection() {
  const [promoProducts, setPromoProducts] = useState<PromoProductCard[]>([]);
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [sales, activeBanners] = await Promise.allSettled([
          getPromoProducts(),
          getActiveBanners(),
        ]);

        if (!active) {
          return;
        }

        setPromoProducts(
          sales.status === "fulfilled" ? mapFlashSalesToPromoCards(sales.value) : []
        );
        setBanners(activeBanners.status === "fulfilled" ? activeBanners.value : []);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const hasContent = promoProducts.length > 0 || banners.length > 0;

  if (!loading && !hasContent) {
    return null;
  }

  return (
    <section className="relative overflow-visible bg-transparent py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-16 h-48 w-48 rounded-full bg-highlight/10 blur-3xl" />
        <div className="absolute right-[10%] bottom-10 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-highlight/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-highlight backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              Promotions
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Offres du moment
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
              Des produits du terroir en vente flash, a prix reduits pour une duree limitee.
            </p>
          </div>

          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-highlight/20 hover:text-highlight"
          >
            <span>Toutes les offres</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`promo-skeleton-${index}`}
                className="h-56 animate-pulse rounded-2xl border border-white/70 bg-white/60"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {banners.length > 0 ? (
              <div className="grid gap-4">
                {banners.slice(0, 2).map((banner) => (
                  <PromoBanner key={banner.id} banner={banner} />
                ))}
              </div>
            ) : null}

            {promoProducts.length > 0 ? (
              <div>
                <div className="mb-5 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-highlight" />
                  <h3 className="text-lg font-semibold text-gray-900">Produits en promotion</h3>
                </div>
                <div className="overflow-visible">
                  <PromoProductsCarousel items={promoProducts} />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
