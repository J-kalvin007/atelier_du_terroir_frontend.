"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { PublicFlashSale } from "@/lib/ecommerce-api";

export function FlashSaleCard({ sale }: { sale: PublicFlashSale }) {
  const hasOriginal =
    sale.original_price && Number(sale.original_price) > Number(sale.sale_price);

  return (
    <Link
      href={`/products/${sale.product_slug}`}
      className="group overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#faf7f2]">
        {sale.product_image ? (
          <Image
            src={sale.product_image}
            alt={sale.product_name || "Produit en promotion"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Aucune image
          </div>
        )}
        {sale.discount_percent > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-white shadow-md">
            -{sale.discount_percent}%
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <p className="line-clamp-1 font-semibold text-gray-900 group-hover:text-primary">
          {sale.product_name || "Produit"}
        </p>
        <p className="mt-1 text-[11px] text-gray-500">Offre du moment</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-lg font-bold text-primary">
            {formatCurrency(parseFloat(sale.sale_price), "FCFA")}
          </p>
          {hasOriginal ? (
            <p className="text-sm text-gray-400 line-through">
              {formatCurrency(parseFloat(sale.original_price), "FCFA")}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
