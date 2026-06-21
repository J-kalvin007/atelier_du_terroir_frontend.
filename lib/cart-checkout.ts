import { getProductBySlug } from "@/lib/ecommerce-api";
import { isUuid } from "@/lib/utils";
import type { CartItem } from "@/store/cartStore";

export type CheckoutLineItem = {
  product_id: string;
  quantity: number;
  variant_id?: string | null;
};

export async function resolveCartItemsForCheckout(
  items: CartItem[]
): Promise<CheckoutLineItem[]> {
  const resolved: CheckoutLineItem[] = [];

  for (const item of items) {
    let productId = item.productId?.trim() ?? "";

    if (item.slug?.trim()) {
      try {
        const product = await getProductBySlug(item.slug.trim());
        productId = product.id;
      } catch {
        if (!isUuid(productId)) {
          throw new Error(
            `Impossible d'identifier le produit « ${item.name} ». Retirez-le du panier puis rajoutez-le depuis la boutique.`
          );
        }
      }
    } else if (!isUuid(productId)) {
      throw new Error(
        `Impossible d'identifier le produit « ${item.name} ». Retirez-le du panier puis rajoutez-le depuis la boutique.`
      );
    }

    resolved.push({
      product_id: productId,
      quantity: item.quantity,
      variant_id: item.variantId,
    });
  }

  return resolved;
}

export function hasResolvableCartItem(item: CartItem) {
  return isUuid(item.productId) || Boolean(item.slug?.trim());
}
