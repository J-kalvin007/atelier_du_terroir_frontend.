"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { authVegetablesImage } from "@/assets/images";
import type { PromoProductCard } from "@/lib/promotions";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export function PromoOfferCard({
  item,
  index,
  disableEntrance = false,
  dimmed = false,
}: {
  item: PromoProductCard;
  index: number;
  disableEntrance?: boolean;
  dimmed?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const imageSrc = item.image || authVegetablesImage;
  const href = `/products/${item.slug}`;

  const cardClassName = cn(
    "relative overflow-hidden rounded-[1.35rem] border border-[#2f684f]/15 bg-gradient-to-br from-[#2f684f] to-[#1f4d3f] p-4 shadow-[0_14px_32px_rgba(31,77,63,0.18)] transition-[filter,opacity] duration-300",
    dimmed && "brightness-[0.88] saturate-[0.85]"
  );

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    addItem({
      productId: item.productId,
      variantId: null,
      name: item.name,
      sku: item.slug,
      price: item.price,
      compareAtPrice: item.comparePrice,
      image: typeof item.image === "string" && item.image ? item.image : null,
      quantity: 1,
      maxStock: 99,
      currency: "FCFA",
      slug: item.slug,
    });
  };

  const discountLabel =
    item.discountPercent > 0
      ? `-${item.discountPercent}%`
      : item.comparePrice && Number(item.comparePrice) > Number(item.price)
        ? `-${Math.round((1 - Number(item.price) / Number(item.comparePrice)) * 100)}%`
        : "PROMO";

  const content = (
    <>
      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_4px_12px_rgba(239,130,25,0.45)]">
        <Zap className="h-3 w-3 fill-current" />
        {discountLabel}
      </span>
      <Link href={href} className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{item.name}</p>
          <p className="mt-1 text-[11px] text-white/65">Offre du moment</p>

          <div className="mt-4 flex flex-wrap items-end gap-2">
            <p className="text-xl font-black text-white">
              {formatCurrency(parseFloat(item.price), "FCFA")}
            </p>
            {item.comparePrice && Number(item.comparePrice) > Number(item.price) ? (
              <p className="text-xs text-white/45 line-through">
                {formatCurrency(parseFloat(item.comparePrice), "FCFA")}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/70">
            <span>{item.reviewCount > 0 ? `${item.reviewCount} avis` : "Selection terroir"}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/12 px-1.5 py-0.5 font-semibold text-white">
              <Star className="h-3 w-3 fill-current" />
              {item.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/25 bg-white shadow-lg">
          <Image src={imageSrc} alt={item.name} fill sizes="96px" className="object-cover" />
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={`Ajouter ${item.name} au panier`}
        className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_18px_rgba(239,130,25,0.35)] transition hover:bg-primary-hover"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    </>
  );

  if (disableEntrance) {
    return <article className={cardClassName}>{content}</article>;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={cardClassName}
    >
      {content}
    </motion.article>
  );
}
