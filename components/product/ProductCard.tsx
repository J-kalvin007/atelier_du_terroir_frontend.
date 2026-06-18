"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, Eye } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { ProductListItem } from "@/lib/ecommerce-api";

type ProductCardProps = {
  product: ProductListItem;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const hasDiscount =
    Boolean(product.compare_at_price) &&
    Number(product.compare_at_price) > Number(product.price);

  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : 0;

  const isOutOfStock =
    product.stock_status === "OUT_OF_STOCK" || product.stock_status === "DISCONTINUED";

  const avgRating = product.avg_rating ?? product.note_produit ?? 0;
  const reviewCount = product.review_count ?? product.count_ratings ?? 0;

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) {
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      sku: product.slug,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? null,
      image: product.primary_image ?? null,
      quantity: 1,
      maxStock: 99,
      currency: product.currency ?? "FCFA",
      slug: product.slug,
    });

    window.setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsWishlisted((current) => !current);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="relative aspect-square overflow-hidden bg-surface">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-110",
                isOutOfStock && "opacity-50 grayscale"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-alt">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {hasDiscount ? (
              <span className="badge-promo flex items-center gap-1 shadow-md">-{discountPct}%</span>
            ) : null}
            {product.is_featured && !hasDiscount ? (
              <span className="badge-new shadow-md">Tendance</span>
            ) : null}
            {product.labels?.includes("bio") ? (
              <span className="rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                Bio
              </span>
            ) : null}
            {isOutOfStock ? (
              <span className="badge-out shadow-md">Indisponible</span>
            ) : (
              <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                Disponible
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-primary text-primary" : "text-foreground/60"
              )}
            />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-lg transition-all",
                isOutOfStock
                  ? "cursor-not-allowed bg-white/50 text-foreground/40"
                  : isAdding
                    ? "bg-success text-white"
                    : "bg-primary text-white hover:bg-primary-hover"
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {isAdding ? "Ajoute ✓" : isOutOfStock ? "Indisponible" : "Ajouter"}
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-lg backdrop-blur-sm">
              <Eye className="h-4 w-4 text-foreground/70" />
            </span>
          </div>
        </div>

        <div className="p-4">
          {product.category_name ? (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-primary/70">
              {product.category_name}
            </p>
          ) : null}

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          {reviewCount > 0 ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5",
                      star <= Math.round(Number(avgRating))
                        ? "fill-highlight text-highlight"
                        : "fill-border text-border"
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted">({reviewCount})</span>
            </div>
          ) : null}

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(product.price, product.currency ?? "FCFA")}
            </span>
            {hasDiscount ? (
              <span className="text-sm text-muted line-through">
                {formatCurrency(product.compare_at_price!, product.currency ?? "FCFA")}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
