"use client";

import { PromoCodeOfferCard } from "@/components/promotions/PromoCodeOfferCard";
import type { PublicPromoCode } from "@/lib/ecommerce-api";

type PromoCodesGridProps = {
  promos: PublicPromoCode[];
};

export function PromoCodesGrid({ promos }: PromoCodesGridProps) {
  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {promos.map((promo, index) => (
        <PromoCodeOfferCard key={promo.id} promo={promo} variant="page" index={index} />
      ))}
    </div>
  );
}
