"use client";

import { useEffect, useState } from "react";
import {
  getActiveBanners,
  getActiveFlashSales,
  getActivePromoCodes,
  getPublicCategories,
  getPublicProducts,
  type ProductListItem,
  type PublicBanner,
  type PublicCategory,
  type PublicFlashSale,
  type PublicPromoCode,
} from "@/lib/ecommerce-api";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import FeaturesSection from "@/components/home/FeaturesSection";
import { TrendingProducts } from "@/components/home/TrendingProducts";

type PreviewState = {
  categories: PublicCategory[];
  products: ProductListItem[];
  promoCodes: PublicPromoCode[];
  banners: PublicBanner[];
  flashSales: PublicFlashSale[];
  error: string | null;
};

const initialState: PreviewState = {
  categories: [],
  products: [],
  promoCodes: [],
  banners: [],
  flashSales: [],
  error: null,
};

export function HomePreview() {
  const [state, setState] = useState<PreviewState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [categories, products, promoCodes, banners, flashSales] = await Promise.all([
          getPublicCategories(),
          getPublicProducts(6),
          getActivePromoCodes(),
          getActiveBanners(),
          getActiveFlashSales(),
        ]);

        if (!active) {
          return;
        }

        setState({
          categories,
          products,
          promoCodes,
          banners,
          flashSales,
          error: null,
        });
      } catch {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          error: "Les donnees catalogue et promotions ne sont pas encore disponibles depuis l'API.",
        }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {state.error ? (
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[1.4rem] border border-[#e8d8c3] bg-[#fffaf4] px-4 py-4 text-sm text-[#72512d]">
            {state.error}
          </div>
        </div>
      ) : null}

      <CategoriesGrid categories={state.categories} loading={loading} />
      <TrendingProducts
        products={state.products}
        promoCodes={state.promoCodes}
        banners={state.banners}
        flashSales={state.flashSales}
        loading={loading}
      />
      <FeaturesSection />
    </div>
  );
}
