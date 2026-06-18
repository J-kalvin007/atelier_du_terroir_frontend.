"use client";

import { formatCurrency } from "@/lib/utils";
import { isFreeShippingPromoType } from "@/lib/shipping";

type CheckoutTotalsSummaryProps = {
  subtotal: number;
  shippingFee: number;
  shippingCharged: number;
  discount: number;
  total: number;
  reductionLabel?: string | null;
  promoType?: string | null;
  className?: string;
};

export function CheckoutTotalsSummary({
  subtotal,
  shippingFee,
  shippingCharged,
  discount,
  total,
  reductionLabel = "Reduction promo",
  promoType,
  className,
}: CheckoutTotalsSummaryProps) {
  const freeShipping = isFreeShippingPromoType(promoType);
  const hasProductDiscount = discount > 0 && !freeShipping;
  const shippingWaived = freeShipping && shippingFee > 0;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm text-[#5d6b58]">
        <span>Sous-total articles</span>
        <span>{formatCurrency(subtotal, "FCFA")}</span>
      </div>
      <div className="mt-2 flex justify-between text-sm text-[#5d6b58]">
        <span>Frais de livraison</span>
        {shippingWaived ? (
          <span>
            <span className="mr-2 text-[#8a9086] line-through">
              {formatCurrency(shippingFee, "FCFA")}
            </span>
            <span className="font-semibold text-emerald-700">Gratuit</span>
          </span>
        ) : (
          <span>{formatCurrency(shippingCharged, "FCFA")}</span>
        )}
      </div>
      {shippingWaived ? (
        <div className="mt-2 flex justify-between text-sm font-medium text-emerald-700">
          <span>{reductionLabel || "Livraison offerte"}</span>
          <span>-{formatCurrency(shippingFee, "FCFA")}</span>
        </div>
      ) : null}
      {hasProductDiscount ? (
        <div className="mt-2 flex justify-between text-sm font-medium text-emerald-700">
          <span>{reductionLabel}</span>
          <span>-{formatCurrency(discount, "FCFA")}</span>
        </div>
      ) : null}
      <div
        className={`flex justify-between font-semibold text-[#1f241c] ${
          shippingWaived || hasProductDiscount
            ? "mt-2 border-t border-[#eadfca] pt-2"
            : "mt-2"
        }`}
      >
        <span>{shippingWaived || hasProductDiscount ? "Total a payer" : "Total"}</span>
        <span className={shippingWaived || hasProductDiscount ? "text-lg text-[#ef8219]" : ""}>
          {formatCurrency(total, "FCFA")}
        </span>
      </div>
    </div>
  );
}
