"use client";

import { PromoCodeUseButton } from "@/components/promotions/PromoCodeUseButton";
import type { PublicPromoCode } from "@/lib/ecommerce-api";

type PromoCodeOfferCardProps = {
  promo: PublicPromoCode;
  variant?: "home" | "page";
  index?: number;
  className?: string;
};

export function PromoCodeOfferCard({
  promo,
  variant = "home",
  index = 0,
  className,
}: PromoCodeOfferCardProps) {
  return (
    <PromoCodeUseButton
      promo={promo}
      variant={variant}
      showDescription
      index={index}
      className={className}
    />
  );
}
