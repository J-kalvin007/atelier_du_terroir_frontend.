import type { ProductListItem, PublicFlashSale, ValidatePromoResponse } from "@/lib/ecommerce-api";
import { getPromoProducts } from "@/lib/ecommerce-api";
import { decodeOrderPromoMeta } from "@/lib/order-promo-meta";
import { getDefaultShippingFee, isFreeShippingPromoType } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";
import type { StaticImageData } from "next/image";

export type PromoProductCard = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | StaticImageData;
  price: string;
  comparePrice: string | null;
  discountPercent: number;
  rating: number;
  reviewCount: number;
};

export function mapFlashSalesToPromoCards(flashSales: PublicFlashSale[]): PromoProductCard[] {
  return flashSales.map((sale) => ({
    id: sale.id,
    productId: sale.product_id ?? sale.id,
    name: sale.product_name || "Produit en promo",
    slug: sale.product_slug,
    image: sale.product_image || "",
    price: sale.sale_price,
    comparePrice: sale.original_price || null,
    discountPercent: sale.discount_percent ?? 0,
    rating: 0,
    reviewCount: 0,
  }));
}

export async function fetchPromoProductCards(): Promise<PromoProductCard[]> {
  const flashSales = await getPromoProducts();
  return mapFlashSalesToPromoCards(flashSales);
}

export function buildFlashSaleBySlugMap(
  flashSales: PublicFlashSale[]
): Map<string, PublicFlashSale> {
  return new Map(flashSales.map((sale) => [sale.product_slug, sale]));
}

export function applyFlashSaleToProduct(
  product: ProductListItem,
  flashSale: PublicFlashSale | undefined
): ProductListItem {
  if (!flashSale) {
    return product;
  }

  const salePrice = flashSale.sale_price;
  const originalPrice = flashSale.original_price || product.price;

  if (Number(salePrice) >= Number(originalPrice)) {
    return product;
  }

  return {
    ...product,
    price: salePrice,
    compare_at_price: originalPrice,
  };
}

export function applyFlashSalesToProducts(
  products: ProductListItem[],
  flashSales: PublicFlashSale[]
): ProductListItem[] {
  const map = buildFlashSaleBySlugMap(flashSales);
  return products.map((product) => applyFlashSaleToProduct(product, map.get(product.slug)));
}

export function findFlashSaleForSlug(
  flashSales: PublicFlashSale[],
  slug: string
): PublicFlashSale | undefined {
  return flashSales.find((sale) => sale.product_slug === slug);
}

type PromoType = "percentage" | "fixed_amount" | "free_shipping" | string;

function readNumeric(value: unknown): number {
  if (value == null || value === "") {
    return 0;
  }

  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computePromoDiscountFromType(
  type: PromoType | undefined,
  value: unknown,
  cartTotal: number
): number {
  const numericValue = readNumeric(value);
  if (numericValue <= 0 || cartTotal <= 0) {
    return 0;
  }

  if (type === "percentage") {
    return Math.round(cartTotal * numericValue) / 100;
  }

  if (type === "fixed_amount") {
    return Math.min(numericValue, cartTotal);
  }

  return 0;
}

export function formatPromoReductionLabel(
  type: PromoType | undefined,
  value: unknown,
  discountAmount: number
): string {
  if (type === "free_shipping") {
    return "Livraison offerte";
  }

  if (type === "percentage" && readNumeric(value) > 0) {
    return `-${readNumeric(value)}%`;
  }

  if (discountAmount > 0) {
    return `-${formatCurrency(discountAmount, "FCFA")}`;
  }

  if (type === "fixed_amount" && readNumeric(value) > 0) {
    return `-${formatCurrency(readNumeric(value), "FCFA")}`;
  }

  return "Reduction promo";
}

export function extractPromoDiscount(
  result: ValidatePromoResponse & Record<string, unknown>,
  cartTotal: number,
  shippingFee = getDefaultShippingFee()
): number {
  if (
    isFreeShippingPromoType(String(result.type ?? "")) ||
    result.free_shipping === true
  ) {
    const waiver = readNumeric(result.shipping_waiver ?? result.discount_amount);
    return waiver > 0 ? waiver : shippingFee;
  }

  const explicit = readNumeric(
    result.discount_amount ??
      result.montant_reduction ??
      result.reduction_amount ??
      result.reduction ??
      result.discount
  );

  if (explicit > 0) {
    return explicit;
  }

  return computePromoDiscountFromType(result.type, result.value, cartTotal);
}

export function isPromoValidationSuccessful(
  result: ValidatePromoResponse & Record<string, unknown>
): boolean {
  if (typeof result.valid === "boolean") {
    return result.valid;
  }

  if (typeof result.is_valid === "boolean") {
    return result.is_valid;
  }

  return Boolean(result.code);
}

export type OrderDiscountSource = {
  items_total?: string | null;
  frais_livraison?: string | null;
  tax_amount?: string | null;
  discount_amount?: string | null;
  total_final?: string | null;
  promo_type?: string | null;
  promo_value?: string | null;
  promo_code?: string | null;
};

export function getOrderPromoCode(order: Record<string, unknown>): string | null {
  const raw =
    order.promo_code ??
    order.code_promo ??
    order.coupon_code ??
    order.promo ??
    order.applied_promo_code;

  if (raw == null || raw === "") {
    return null;
  }

  const code = String(raw).trim();
  return code || null;
}

export function orderHasPromoCode(order: Record<string, unknown>): boolean {
  if (getOrderPromoCode(order)) {
    return true;
  }

  if (resolveOrderDiscount(order) > 0) {
    return true;
  }

  if (decodeOrderPromoMeta(String(order.notes ?? ""))) {
    return true;
  }

  return false;
}

export function resolveOrderDiscount(order: OrderDiscountSource): number {
  const explicit = readNumeric(order.discount_amount);
  if (explicit > 0) {
    return explicit;
  }

  const itemsTotal = readNumeric(order.items_total);
  const shipping = readNumeric(order.frais_livraison);
  const tax = readNumeric(order.tax_amount);
  const totalFinal = readNumeric(order.total_final);
  const computed = itemsTotal + shipping + tax - totalFinal;

  if (computed > 0.01) {
    return Math.round(computed * 100) / 100;
  }

  return computePromoDiscountFromType(order.promo_type ?? undefined, order.promo_value, itemsTotal);
}

export function formatOrderReductionLabel(
  order: OrderDiscountSource,
  discountAmount: number
): string {
  if (isFreeShippingPromoType(order.promo_type ?? undefined)) {
    return "Livraison offerte";
  }

  return formatPromoReductionLabel(order.promo_type ?? undefined, order.promo_value, discountAmount);
}

export function orderHasFreeShippingPromo(order: Record<string, unknown>): boolean {
  const promoType =
    order.promo_type ??
    decodeOrderPromoMeta(String(order.notes ?? ""))?.type ??
    null;

  return isFreeShippingPromoType(String(promoType ?? ""));
}

export function isFreeShippingApplied(order: OrderDiscountSource): boolean {
  if (!orderHasFreeShippingPromo(order as Record<string, unknown>)) {
    return false;
  }

  return readNumeric(order.frais_livraison) <= 0;
}
