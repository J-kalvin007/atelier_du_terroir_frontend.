"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Sparkles, Star } from "lucide-react";
import {
  getActiveFlashSales,
  getTrendingProducts,
  type ProductListItem,
} from "@/lib/ecommerce-api";
import { applyFlashSalesToProducts } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";

function TrendingProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="aspect-square animate-pulse bg-[#f3efe6]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-16 animate-pulse rounded bg-[#f3efe6]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#f3efe6]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#f3efe6]" />
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <div className="h-4 w-20 animate-pulse rounded bg-[#f3efe6]" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-[#f3efe6]" />
        </div>
      </div>
    </div>
  );
}

export default function HomeTrendingProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [trendingProducts, flashSales] = await Promise.all([
          getTrendingProducts(4),
          getActiveFlashSales().catch(() => []),
        ]);

        setProducts(applyFlashSalesToProducts(trendingProducts, flashSales));
      } catch (fetchError) {
        console.error("Error loading trending products:", fetchError);
        setProducts([]);
        setError("Impossible de charger les produits les plus demandes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative overflow-hidden bg-transparent py-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-10 h-32 w-32 rounded-full bg-highlight/10 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-highlight/15 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-highlight backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Selection
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Les plus demandes
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-gray-600">
              Une selection rigoureuse de produits qui ont conquis notre communaute.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-highlight/20 hover:text-highlight"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <TrendingProductSkeleton key={`trending-skeleton-${index}`} />
              ))
            : products.map((product, idx) => {
                const avgRating = Number(product.avg_rating ?? product.note_produit ?? 0);
                const reviewCount = product.review_count ?? product.count_ratings ?? 0;
                const currency = product.currency ?? "FCFA";
                const isOutOfStock =
                  product.stock_status === "OUT_OF_STOCK" ||
                  product.stock_status === "DISCONTINUED";

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
                    className="group overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  >
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
                        {product.primary_image ? (
                          <Image
                            src={product.primary_image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Aucune image
                          </div>
                        )}

                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
                          {product.category_name ? (
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-700 shadow-sm">
                              {product.category_name}
                            </span>
                          ) : (
                            <span />
                          )}
                          {!isOutOfStock ? (
                            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                              Disponible
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                              Indisponible
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-3">
                      {avgRating > 0 ? (
                        <div className="mb-1.5 flex items-center gap-0.5 text-primary">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-3 w-3 ${index < Math.floor(avgRating) ? "fill-current" : ""}`}
                            />
                          ))}
                          <span className="ml-0.5 text-[10px] font-medium text-gray-700">
                            {avgRating.toFixed(1)}
                          </span>
                          {reviewCount > 0 ? (
                            <span className="text-[10px] text-gray-400">({reviewCount})</span>
                          ) : null}
                        </div>
                      ) : null}

                      <Link href={`/products/${product.slug}`}>
                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                        {product.category_name
                          ? `Produit ${product.category_name.toLowerCase()} selectionne pour sa qualite et sa fraicheur.`
                          : "Produit du terroir selectionne pour sa qualite et sa fraicheur."}
                      </p>

                      <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.price, currency)}
                          </p>
                          {product.compare_at_price &&
                          Number(product.compare_at_price) > Number(product.price) ? (
                            <p className="text-[10px] text-gray-400 line-through">
                              {formatCurrency(product.compare_at_price, currency)}
                            </p>
                          ) : null}
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-primary"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>Voir</span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
        </div>

        {!loading && products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">Aucun produit disponible pour le moment.</p>
            <p className="mt-1 text-xs text-gray-500">
              Les produits marques comme top dans l&apos;admin apparaitront ici en priorite.
            </p>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            <span>Explorer la collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
