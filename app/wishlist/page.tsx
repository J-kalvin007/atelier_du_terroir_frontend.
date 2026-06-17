"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { StorefrontPage } from "@/components/layout/StorefrontPage";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getMyFavorites, type FavoriteProduct } from "@/lib/ecommerce-api";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const session = useAuthSession();
  const [items, setItems] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      return;
    }

    void getMyFavorites(session.token)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [session?.token]);

  return (
    <StorefrontPage>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-7 w-7 text-[#ef8219]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1f241c]">Ma liste de souhaits</h1>
            <p className="text-sm text-[#5c6a59]">Produits favoris enregistres sur votre compte.</p>
          </div>
        </div>

        {!session?.token ? (
          <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
            <p className="text-sm text-[#5c6a59]">Connectez-vous pour voir vos favoris.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-[#ef8219] px-5 py-2 text-sm font-semibold text-white">
              Connexion
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16 text-[#8b5e34]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
            <p className="text-sm text-[#5c6a59]">Aucun favori pour le moment.</p>
            <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-[#ef8219] hover:underline">
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-sm transition hover:-translate-y-1"
              >
                <div className="relative h-44 bg-[#f7f3eb]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-contain p-3" sizes="240px" />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#1f241c]">{item.name}</p>
                  <p className="mt-2 text-sm font-bold text-[#ef8219]">
                    {formatCurrency(parseFloat(item.price), "FCFA")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StorefrontPage>
  );
}
