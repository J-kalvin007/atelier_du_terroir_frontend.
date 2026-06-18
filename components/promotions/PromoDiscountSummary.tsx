"use client";

import { formatCurrency } from "@/lib/utils";

type PromoDiscountSummaryProps = {
  subtotal: number;
  discount: number;
  total: number;
  reductionLabel?: string | null;
  className?: string;
};

export function PromoDiscountSummary({
  subtotal,
  discount,
  total,
  reductionLabel = "Reduction promo",
  className,
}: PromoDiscountSummaryProps) {
  const hasDiscount = discount > 0;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm text-[#5d6b58]">
        <span>Sous-total</span>
        <span>{formatCurrency(subtotal, "FCFA")}</span>
      </div>
      {hasDiscount ? (
        <div className="mt-2 flex justify-between text-sm font-medium text-emerald-700">
          <span>{reductionLabel}</span>
          <span>-{formatCurrency(discount, "FCFA")}</span>
        </div>
      ) : null}
      <div
        className={`flex justify-between font-semibold text-[#1f241c] ${
          hasDiscount ? "mt-2 border-t border-[#eadfca] pt-2" : "mt-2"
        }`}
      >
        <span>{hasDiscount ? "Total apres reduction" : "Total"}</span>
        <span className={hasDiscount ? "text-lg text-[#ef8219]" : ""}>
          {formatCurrency(total, "FCFA")}
        </span>
      </div>
    </div>
  );
}
