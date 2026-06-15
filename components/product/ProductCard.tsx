"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductListItem } from "@/lib/ecommerce-api";

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const productHref = `/products/${product.slug}`;
  const hasDiscount =
    Boolean(product.compare_at_price) &&
    Number(product.compare_at_price) > Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : 0;

  const isOutOfStock =
    product.stock_status === "OUT_OF_STOCK" || product.stock_status === "DISCONTINUED";

  return (
    <Link
      href={productHref}
      className="group overflow-hidden rounded-[1.6rem] border border-[#e8dece] bg-white shadow-[0_18px_60px_rgba(66,49,23,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(66,49,23,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f3ede2]">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className={`object-cover transition duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#1f4d3f,#8b5e34)] text-sm font-semibold uppercase tracking-[0.18em] text-white/86">
            Atelier
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {hasDiscount ? (
            <span className="rounded-full bg-[#b8402c] px-3 py-1 text-[11px] font-semibold text-white">
              -{discountPercent}%
            </span>
          ) : null}
          {product.is_featured ? (
            <span className="rounded-full bg-[#1f4d3f] px-3 py-1 text-[11px] font-semibold text-white">
              Tendance
            </span>
          ) : null}
          {product.labels?.includes("bio") ? (
            <span className="rounded-full bg-[#5f7a31] px-3 py-1 text-[11px] font-semibold text-white">
              Bio
            </span>
          ) : null}
          {isOutOfStock ? (
            <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white">
              Epuisé
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {product.category_name ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
            {product.category_name}
          </p>
        ) : null}

        <div>
          <h3 className="line-clamp-2 text-base font-semibold text-[#1f251f]">{product.name}</h3>
          <p className="mt-2 text-sm text-[#5d6b58]">
            Note {product.note_produit ?? product.avg_rating ?? 0} | {product.count_ratings ?? product.review_count ?? 0} avis
          </p>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-[#1f4d3f]">
            {product.price} {product.currency ?? "FCFA"}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-[#8a9086] line-through">
              {product.compare_at_price} {product.currency ?? "FCFA"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
