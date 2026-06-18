import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getDefaultShippingFee, isFreeShippingPromoType } from "@/lib/shipping";

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  quantity: number;
  maxStock: number;
  currency: string;
  slug: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  promoLabel: string | null;
  promoType: string | null;
  promoValue: string | null;
  loyaltyPointsToUse: number;
  isDrawerOpen: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  pruneInvalidItems: (isValidProductId: (productId: string) => boolean) => number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, qty: number) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null, discount: number, label?: string | null, meta?: { type?: string | null; value?: string | null }) => void;
  setLoyaltyPoints: (points: number) => void;
  toggleDrawer: (open?: boolean) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getShippingCharged: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      promoLabel: null,
      promoType: null,
      promoValue: null,
      loyaltyPointsToUse: 0,
      isDrawerOpen: false,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      pruneInvalidItems: (isValidProductId) => {
        const removedCount = get().items.filter((item) => !isValidProductId(item.productId)).length;

        if (removedCount === 0) {
          return 0;
        }

        set((state) => ({
          items: state.items.filter((item) => isValidProductId(item.productId)),
        }));

        return removedCount;
      },

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (entry) => entry.productId === item.productId && entry.variantId === item.variantId
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(existing.quantity + item.quantity, existing.maxStock),
            };
            return { items: updated, isDrawerOpen: true };
          }

          return { items: [...state.items, item], isDrawerOpen: true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (entry) => !(entry.productId === productId && entry.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, qty) => {
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter(
                (entry) => !(entry.productId === productId && entry.variantId === variantId)
              ),
            };
          }

          return {
            items: state.items.map((entry) =>
              entry.productId === productId && entry.variantId === variantId
                ? { ...entry, quantity: Math.min(qty, entry.maxStock) }
                : entry
            ),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          promoCode: null,
          promoDiscount: 0,
          promoLabel: null,
          promoType: null,
          promoValue: null,
          loyaltyPointsToUse: 0,
        });
      },

      setPromoCode: (code, discount, label, meta) => {
        set({
          promoCode: code,
          promoDiscount: discount,
          promoLabel: label ?? null,
          promoType: meta?.type ?? null,
          promoValue: meta?.value ?? null,
        });
      },

      setLoyaltyPoints: (points) => {
        set({ loyaltyPointsToUse: points });
      },

      toggleDrawer: (open) => {
        set((state) => ({
          isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen,
        }));
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0),

      getShippingFee: () => getDefaultShippingFee(),

      getShippingCharged: () => {
        const state = get();
        if (isFreeShippingPromoType(state.promoType)) {
          return 0;
        }
        return state.items.length > 0 ? getDefaultShippingFee() : 0;
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const shipping = state.getShippingCharged();
        const freeShipping = isFreeShippingPromoType(state.promoType);

        if (freeShipping) {
          return Math.max(0, subtotal + shipping);
        }

        return Math.max(0, subtotal + shipping - state.promoDiscount);
      },
    }),
    {
      name: "atelier-du-terroir-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        promoLabel: state.promoLabel,
        promoType: state.promoType,
        promoValue: state.promoValue,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
