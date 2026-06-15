"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { getProductBySlug, type PublicProductDetail } from "@/lib/ecommerce-api";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import { LegacyFooter } from "@/components/home/LegacyFooter";

type Props = {
  slug: string;
};

export default function ProductDetailClient({ slug }: Props) {
  const [product, setProduct] = useState<PublicProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        if (!active) return;
        setProduct(data);
        setSelectedImage(0);
        setError(null);
      } catch {
        if (!active) return;
        setProduct(null);
        setError("Impossible de charger ce produit.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  const images = useMemo(() => {
    if (!product) return [];
    const gallery = (product.images ?? []).map((image) => image.image).filter(Boolean) as string[];
    if (gallery.length > 0) return gallery;
    const fallback = product.primary_image || product.image || product.image_url || product.thumbnail;
    return fallback ? [fallback] : [];
  }, [product]);

  const categoryName =
    product && typeof product.category === "object" ? product.category?.name : "Catalogue";

  const hasDiscount = false;
  const isOutOfStock = product?.is_in_stock === "OUT_OF_STOCK";

  function handleAddToCart() {
    if (!product) return;

    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      sku: product.sku,
      price: product.price,
      compareAtPrice: null,
      image: images[0] ?? null,
      quantity,
      maxStock: Math.max(product.stock ?? 1, 1),
      currency: "FCFA",
      slug: product.slug,
    });

    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1800);
  }

  return (
    <>
      <LegacyHeader />
      <main className="min-h-screen bg-[#f6f1e8] pt-24 text-[#1f241c]">
        <div className="border-b border-[#e7d7c1] bg-white/70">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm text-[#5d6b58]">
            <Link href="/" className="hover:text-[#8b5e34]">
              Accueil
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-[#8b5e34]">
              Boutique
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-[#1f241c]">{product?.name ?? slug}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          {loading ? (
            <div className="rounded-[2rem] border border-[#e7d7c1] bg-white p-12 text-center text-[#5d6b58]">
              Chargement du produit...
            </div>
          ) : error || !product ? (
            <div className="rounded-[2rem] border border-[#e7d7c1] bg-white p-12 text-center">
              <p className="text-lg font-semibold text-[#1f241c]">{error ?? "Produit introuvable"}</p>
              <Link
                href="/products"
                className="mt-4 inline-flex rounded-full bg-[#1f4d3f] px-5 py-3 text-sm font-semibold text-white"
              >
                Retour au catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[#e7d7c1] bg-white">
                  {images[selectedImage] ? (
                    <Image
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f3ede2] text-[#8b5e34]">
                      Aucune image
                    </div>
                  )}
                </div>

                {images.length > 1 ? (
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                          selectedImage === index ? "border-[#8b5e34]" : "border-[#e7d7c1]"
                        }`}
                      >
                        <Image src={image} alt={`Vue ${index + 1}`} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                    {categoryName}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f241c]">{product.name}</h1>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#5d6b58]">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-[#e7d7c1] text-[#e7d7c1]" />
                      ))}
                    </div>
                    <span>Produit du terroir</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#1f4d3f]">
                    {formatCurrency(product.price, "FCFA")}
                  </span>
                  {hasDiscount ? (
                    <span className="text-lg text-[#8a9086] line-through">—</span>
                  ) : null}
                </div>

                <p className="leading-8 text-[#586657]">{product.description || "Aucune description."}</p>

                <div className="rounded-2xl border border-[#e7d7c1] bg-white/80 p-4 text-sm text-[#5d6b58]">
                  <p>SKU: {product.sku}</p>
                  <p>Stock: {product.stock ?? 0}</p>
                  <p>Statut: {product.is_in_stock ?? "IN_STOCK"}</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center rounded-2xl border border-[#e7d7c1] bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-12 w-12 items-center justify-center hover:bg-[#f3ede2]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-12 w-12 items-center justify-center hover:bg-[#f3ede2]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#8b5e34] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#744b27] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                    {isOutOfStock ? "Rupture de stock" : isAdded ? "Ajoute au panier" : "Ajouter au panier"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <LegacyFooter />
    </>
  );
}
