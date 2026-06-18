export const FALLBACK_SHIPPING_FEE = 2000;

type AdminSettings = {
  defaultShippingRate?: string;
};

export function getDefaultShippingFee(): number {
  if (typeof window === "undefined") {
    return FALLBACK_SHIPPING_FEE;
  }

  try {
    const raw = window.localStorage.getItem("atelier_admin_settings");
    if (!raw) {
      return FALLBACK_SHIPPING_FEE;
    }

    const settings = JSON.parse(raw) as AdminSettings;
    const parsed = parseFloat(String(settings.defaultShippingRate ?? ""));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : FALLBACK_SHIPPING_FEE;
  } catch {
    return FALLBACK_SHIPPING_FEE;
  }
}

export function isFreeShippingPromoType(type: string | null | undefined): boolean {
  return String(type ?? "").toLowerCase() === "free_shipping";
}
