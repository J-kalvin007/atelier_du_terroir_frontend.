"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, Tag, Zap } from "lucide-react";
import { StorefrontPage } from "@/components/layout/StorefrontPage";
import {
  getActiveFlashSales,
  getActivePromoCodes,
  type PublicFlashSale,
  type PublicPromoCode,
} from "@/lib/ecommerce-api";
import { formatCurrency } from "@/lib/utils";

export default function PromotionsPage() {
  const [promoCodes, setPromoCodes] = useState<PublicPromoCode[]>([]);
  const [flashSales, setFlashSales] = useState<PublicFlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [codes, sales] = await Promise.allSettled([
          getActivePromoCodes(),
          getActiveFlashSales(),
        ]);
        setPromoCodes(codes.status === "fulfilled" ? codes.value : []);
        setFlashSales(sales.status === "fulfilled" ? sales.value : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <StorefrontPage>
      <section className="bg-[#1f4d3f] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Offres du moment
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">Promotions exclusives</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Codes promo actifs et ventes flash disponibles sur la boutique.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16 text-[#8b5e34]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <div className="mb-5 flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#ef8219]" />
                <h2 className="text-xl font-bold text-[#1f241c]">Codes promo actifs</h2>
              </div>
              {promoCodes.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-8 text-center text-sm text-[#5c6a59]">
                  Aucun code promo actif pour le moment.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {promoCodes.map((promo) => (
                    <div key={promo.id} className="rounded-2xl border border-[#eadcca] bg-white p-5 shadow-sm">
                      <p className="text-2xl font-black tracking-wider text-[#ef8219]">{promo.code}</p>
                      <p className="mt-2 text-sm text-[#52604e]">{promo.description || "Reduction disponible"}</p>
                      <p className="mt-3 text-sm font-semibold text-[#1f4d3f]">
                        {promo.type === "percentage"
                          ? `${promo.value}%`
                          : formatCurrency(parseFloat(promo.value), "FCFA")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#ef8219]" />
                <h2 className="text-xl font-bold text-[#1f241c]">Ventes flash</h2>
              </div>
              {flashSales.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-8 text-center text-sm text-[#5c6a59]">
                  Aucune vente flash en cours.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {flashSales.map((sale) => (
                    <Link
                      key={sale.id}
                      href={`/products/${sale.product_slug}`}
                      className="overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {sale.product_image ? (
                        <div className="relative h-40 bg-[#f7f3eb]">
                          <Image src={sale.product_image} alt={sale.product_name || "Produit"} fill className="object-contain p-3" sizes="240px" />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <p className="font-semibold text-[#1f241c]">{sale.product_name || "Produit"}</p>
                        <p className="mt-2 text-lg font-bold text-[#ef8219]">
                          {formatCurrency(parseFloat(sale.sale_price), "FCFA")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex rounded-full bg-[#ef8219] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d86d14]"
              >
                Voir toute la boutique
              </Link>
            </div>
          </div>
        )}
      </div>
    </StorefrontPage>
  );
}
