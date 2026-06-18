"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { validatePromoCode, type PublicPromoCode } from "@/lib/ecommerce-api";
import { getDefaultShippingFee } from "@/lib/shipping";
import {
  extractPromoDiscount,
  formatPromoReductionLabel,
  isPromoValidationSuccessful,
} from "@/lib/promotions";
import { readApiError } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export type ApplyPromoResult =
  | { ok: true; pending?: boolean; message: string }
  | { ok: false; reason?: "login"; message?: string };

function buildLabelFromPromo(promo: PublicPromoCode, discount: number) {
  return formatPromoReductionLabel(promo.type, promo.value, discount);
}

export function useApplyPromoCode() {
  const router = useRouter();
  const session = useAuthSession();
  const { setPromoCode, toggleDrawer, promoCode } = useCartStore();
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const applyValidatedPromo = useCallback(
    (
      code: string,
      subtotal: number,
      result: Record<string, unknown>,
      fallbackLabel?: string
    ) => {
      const discount = extractPromoDiscount(result, subtotal, getDefaultShippingFee());
      const label =
        fallbackLabel ??
        formatPromoReductionLabel(String(result.type ?? ""), result.value, discount);
      setPromoCode(code, discount, label, {
        type: result.type ? String(result.type) : null,
        value: result.value != null ? String(result.value) : null,
      });
      return discount;
    },
    [setPromoCode]
  );

  const applyCode = useCallback(
    async (
      code: string,
      options?: { openCart?: boolean; promo?: PublicPromoCode }
    ): Promise<ApplyPromoResult> => {
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) {
        return { ok: false, message: "Code promo invalide." };
      }

      if (!session?.token) {
        const redirectPath =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/promotions";
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return { ok: false, reason: "login" };
      }

      const { items, getSubtotal } = useCartStore.getState();
      const subtotal = getSubtotal();
      const fallbackLabel = options?.promo ? buildLabelFromPromo(options.promo, 0) : undefined;
      const cartItems = items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));
      const shippingFee = getDefaultShippingFee();

      if (subtotal <= 0) {
        setPromoCode(normalizedCode, 0, fallbackLabel ?? "Reduction promo", {
          type: options?.promo?.type ?? null,
          value: options?.promo?.value ?? null,
        });
        if (options?.openCart !== false) {
          toggleDrawer(true);
        }
        return {
          ok: true,
          pending: true,
          message: "Reduction enregistree. Ajoutez des articles au panier.",
        };
      }

      setApplyingCode(normalizedCode);
      try {
        const result = (await validatePromoCode(
          session.token,
          normalizedCode,
          subtotal.toFixed(2),
          cartItems,
          shippingFee.toFixed(2)
        )) as Record<string, unknown>;

        if (!isPromoValidationSuccessful(result)) {
          return {
            ok: false,
            message:
              String(result.detail ?? result.error_code ?? "") ||
              "Ce code promo n'est pas valide.",
          };
        }

        const discount = applyValidatedPromo(
          String(result.code ?? normalizedCode).toUpperCase(),
          subtotal,
          result,
          options?.promo ? buildLabelFromPromo(options.promo, extractPromoDiscount(result, subtotal)) : undefined
        );

        if (options?.openCart !== false) {
          toggleDrawer(true);
        }

        return {
          ok: true,
          message:
            String(result.type ?? "") === "free_shipping"
              ? "Livraison offerte appliquee."
              : discount > 0
              ? `Reduction de ${discount.toLocaleString("fr-FR")} FCFA appliquee.`
              : "Code promo applique.",
        };
      } catch (error) {
        return { ok: false, message: readApiError(error, "Impossible d'appliquer ce code promo.") };
      } finally {
        setApplyingCode(null);
      }
    },
    [applyValidatedPromo, router, session?.token, setPromoCode, toggleDrawer]
  );

  const revalidateActiveCode = useCallback(async () => {
    if (!promoCode || !session?.token) {
      return;
    }

    const { items, getSubtotal } = useCartStore.getState();
    const subtotal = getSubtotal();
    if (subtotal <= 0) {
      setPromoCode(promoCode, 0, "Reduction promo", null);
      return;
    }

    const cartItems = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    const shippingFee = getDefaultShippingFee();

    try {
      const result = (await validatePromoCode(
        session.token,
        promoCode,
        subtotal.toFixed(2),
        cartItems,
        shippingFee.toFixed(2)
      )) as Record<string, unknown>;

      if (!isPromoValidationSuccessful(result)) {
        setPromoCode(null, 0, null, null);
        return;
      }

      applyValidatedPromo(promoCode, subtotal, result);
    } catch {
      /* keep existing promo on transient errors */
    }
  }, [applyValidatedPromo, promoCode, session?.token, setPromoCode]);

  return {
    applyCode,
    revalidateActiveCode,
    applyingCode,
    activePromoCode: promoCode,
  };
}
