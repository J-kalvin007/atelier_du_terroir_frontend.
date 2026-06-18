import { isFreeShippingPromoType } from "@/lib/shipping";

export type StoredOrderPromo = {
  code: string;
  discount: number;
  type?: string;
  value?: string;
  label?: string;
};

const PROMO_META_PREFIX = "[[AT_PROMO:";
const PROMO_META_SUFFIX = "]]";
const STORAGE_KEY = "atelier-du-terroir-order-promos";

function readStorageMap(): Record<string, StoredOrderPromo> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, StoredOrderPromo>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorageMap(map: Record<string, StoredOrderPromo>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function encodeOrderPromoMeta(promo: StoredOrderPromo): string {
  return `${PROMO_META_PREFIX}${JSON.stringify(promo)}${PROMO_META_SUFFIX}`;
}

export function decodeOrderPromoMeta(notes: string | null | undefined): StoredOrderPromo | null {
  if (!notes) {
    return null;
  }

  const start = notes.indexOf(PROMO_META_PREFIX);
  if (start === -1) {
    return null;
  }

  const end = notes.indexOf(PROMO_META_SUFFIX, start);
  if (end === -1) {
    return null;
  }

  try {
    return JSON.parse(notes.slice(start + PROMO_META_PREFIX.length, end)) as StoredOrderPromo;
  } catch {
    return null;
  }
}

export function stripOrderPromoMeta(notes: string | null | undefined): string {
  if (!notes) {
    return "";
  }

  const start = notes.indexOf(PROMO_META_PREFIX);
  if (start === -1) {
    return notes.trim();
  }

  return notes.slice(0, start).trim();
}

export function appendOrderPromoMeta(notes: string, promo: StoredOrderPromo): string {
  const base = stripOrderPromoMeta(notes);
  const meta = encodeOrderPromoMeta(promo);
  return base ? `${base}\n${meta}` : meta;
}

export function saveOrderPromoSnapshot(reference: string, promo: StoredOrderPromo) {
  if (!reference.trim()) {
    return;
  }

  const map = readStorageMap();
  map[reference.trim()] = promo;
  writeStorageMap(map);
}

export function readOrderPromoSnapshot(reference: string): StoredOrderPromo | null {
  if (!reference.trim()) {
    return null;
  }

  return readStorageMap()[reference.trim()] ?? null;
}

type OrderPromoMergeTarget = {
  items_total?: string | null;
  frais_livraison?: string | null;
  tax_amount?: string | null;
  discount_amount?: string | null;
  total_final?: string | null;
  notes?: string | null;
  promo_code?: string | null;
  promo_type?: string | null;
  promo_value?: string | null;
  reference?: string;
};

function readAmount(value: unknown): number {
  if (value == null || value === "") {
    return 0;
  }

  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mergeOrderWithPromoMeta<T extends OrderPromoMergeTarget>(order: T): T {
  const fromNotes = decodeOrderPromoMeta(order.notes ?? "");
  const fromStorage = order.reference ? readOrderPromoSnapshot(order.reference) : null;
  const promo = fromNotes ?? fromStorage;

  if (!promo || promo.discount <= 0) {
    if (!promo || !isFreeShippingPromoType(promo.type)) {
      return order;
    }
  }

  const itemsTotal = readAmount(order.items_total);
  const shipping = readAmount(order.frais_livraison);
  const tax = readAmount(order.tax_amount);
  const existingDiscount = readAmount(order.discount_amount);
  const isFreeShipping = isFreeShippingPromoType(promo.type);
  const discount = existingDiscount > 0 ? existingDiscount : promo.discount;
  const totalFinal = isFreeShipping
    ? Math.max(0, itemsTotal + tax)
    : Math.max(0, itemsTotal + shipping + tax - discount);

  return {
    ...order,
    promo_code: order.promo_code ?? promo.code,
    promo_type: order.promo_type ?? promo.type ?? null,
    promo_value: order.promo_value ?? promo.value ?? null,
    discount_amount: String(discount),
    frais_livraison: isFreeShipping ? "0" : order.frais_livraison,
    total_final: String(totalFinal),
    notes: stripOrderPromoMeta(order.notes ?? ""),
  };
}
