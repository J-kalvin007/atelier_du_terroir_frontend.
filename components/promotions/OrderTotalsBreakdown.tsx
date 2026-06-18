"use client";

import { formatCurrency } from "@/lib/utils";
import {
  formatOrderReductionLabel,
  getOrderPromoCode,
  isFreeShippingApplied,
  orderHasFreeShippingPromo,
  resolveOrderDiscount,
} from "@/lib/promotions";
import { getDefaultShippingFee } from "@/lib/shipping";
import type { OrderDiscountSource } from "@/lib/promotions";

type OrderTotalsBreakdownProps = {
  order: OrderDiscountSource & Record<string, unknown>;
  variant?: "client" | "admin";
  showPromoCode?: boolean;
  embedded?: boolean;
};

export function OrderTotalsBreakdown({
  order,
  variant = "client",
  showPromoCode = true,
  embedded = false,
}: OrderTotalsBreakdownProps) {
  const discount = resolveOrderDiscount(order);
  const reductionLabel = formatOrderReductionLabel(order, discount);
  const promoCode = getOrderPromoCode(order);
  const freeShippingPromo = orderHasFreeShippingPromo(order);
  const freeShippingOk = isFreeShippingApplied(order);
  const subtotal = parseFloat(order.items_total || "0");
  const shipping = parseFloat(order.frais_livraison || "0");
  const tax = parseFloat(order.tax_amount || "0");
  const total = parseFloat(order.total_final || "0");
  const referenceShippingFee =
    freeShippingPromo && shipping <= 0 && discount > 0 ? discount : getDefaultShippingFee();
  const displayDiscount =
    discount > 0 ? discount : freeShippingPromo && shipping <= 0 ? referenceShippingFee : 0;
  const totalBeforeDiscount = subtotal + (freeShippingPromo ? referenceShippingFee : shipping) + tax;

  const labelClass = variant === "admin" ? "text-slate-600" : "text-[#5c6a59]";
  const discountClass = variant === "admin" ? "text-emerald-700" : "text-emerald-700";
  const totalClass = variant === "admin" ? "text-slate-900" : "text-[#1f241c]";
  const boxClass = embedded
    ? ""
    : variant === "admin"
      ? "rounded-2xl border border-[#eadfce] bg-[#fbf5ed] p-4"
      : "rounded-2xl border border-[#eadcca] bg-[#fbf5ed] p-4";

  return (
    <div className={boxClass}>
      {showPromoCode && promoCode ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 ${
            variant === "admin"
              ? "border-[#d4c0a7] bg-white"
              : "border-[#eadcca] bg-white"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8b5e34]">
            Code promo utilise
          </p>
          <p className="mt-1 font-mono text-xl font-black tracking-wider text-[#ef8219]">
            {promoCode}
          </p>
          {discount > 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Reduction {reductionLabel.replace(/^-/, "")} : -{formatCurrency(discount, "FCFA")}
            </p>
          ) : freeShippingPromo ? (
            <p className="mt-2 text-sm text-emerald-700">Livraison offerte</p>
          ) : null}
        </div>
      ) : null}

      {variant === "admin" && freeShippingPromo ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            freeShippingOk
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {freeShippingOk
            ? "Livraison gratuite correctement appliquee (frais de livraison a 0 FCFA)."
            : `Attention : code livraison gratuite present mais frais de livraison factures (${formatCurrency(shipping, "FCFA")}).`}
        </div>
      ) : null}

      <div className={`space-y-2 text-sm ${labelClass}`}>
        <div className="flex justify-between">
          <span>Sous-total articles</span>
          <span>{formatCurrency(subtotal, "FCFA")}</span>
        </div>
        <div className="flex justify-between">
          <span>Frais de livraison</span>
          {freeShippingPromo && shipping <= 0 ? (
            <span>
              <span className="mr-2 text-[#8a9086] line-through">
                {formatCurrency(referenceShippingFee, "FCFA")}
              </span>
              <span className="font-semibold text-emerald-700">Gratuit</span>
            </span>
          ) : (
            <span>{formatCurrency(shipping, "FCFA")}</span>
          )}
        </div>
        {(displayDiscount > 0 || freeShippingPromo) ? (
          <>
            <div className="flex justify-between text-[#8a9086]">
              <span>Prix avant reduction</span>
              <span className="line-through">{formatCurrency(totalBeforeDiscount, "FCFA")}</span>
            </div>
            <div className={`flex justify-between font-medium ${discountClass}`}>
              <span>Reduction ({reductionLabel.replace(/^-/, "")})</span>
              <span>-{formatCurrency(displayDiscount, "FCFA")}</span>
            </div>
          </>
        ) : null}
        {tax > 0 ? (
          <div className="flex justify-between">
            <span>Taxes</span>
            <span>{formatCurrency(tax, "FCFA")}</span>
          </div>
        ) : null}
        <div
          className={`flex justify-between border-t border-[#d4c0a7] pt-2 text-base font-bold ${totalClass}`}
        >
          <span>{displayDiscount > 0 || freeShippingPromo ? "Prix apres reduction" : "Total"}</span>
          <span className={displayDiscount > 0 || freeShippingPromo ? "text-[#ef8219]" : ""}>
            {formatCurrency(total, "FCFA")}
          </span>
        </div>
      </div>
    </div>
  );
}
