"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Sparkles, Star } from "lucide-react";
import {
  orangeImage,
  ananasImage,
  maisProductImage,
  maniocImage,
} from "@/assets/images";
import type { StaticImageData } from "next/image";

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  stock_status: string;
  avg_rating: number;
  review_count: number;
  primary_image: StaticImageData;
  category_name: string;
  description: string;
};

const MOCK_PRODUCTS: FeaturedProduct[] = [
  {
    id: "1",
    name: "Orange",
    slug: "orange",
    price: "16500",
    compare_at_price: "21000",
    currency: "FCFA",
    stock_status: "IN_STOCK",
    avg_rating: 4.8,
    review_count: 234,
    primary_image: orangeImage,
    category_name: "Fruits",
    description:
      "Des oranges de premiere qualite, recoltees a maturite pour offrir une saveur sucree, une chair genereuse et une fraicheur exceptionnelle.",
  },
  {
    id: "2",
    name: "Ananas",
    slug: "ananas",
    price: "8500",
    compare_at_price: null,
    currency: "FCFA",
    stock_status: "IN_STOCK",
    avg_rating: 4.9,
    review_count: 189,
    primary_image: ananasImage,
    category_name: "Fruits",
    description:
      "Des ananas frais et savoureux, recoltes a maturite pour garantir une chair juteuse, sucree et riche en nutriments.",
  },
  {
    id: "3",
    name: "Mais",
    slug: "mais",
    price: "5900",
    compare_at_price: "7500",
    currency: "FCFA",
    stock_status: "IN_STOCK",
    avg_rating: 4.7,
    review_count: 156,
    primary_image: maisProductImage,
    category_name: "Cereales",
    description:
      "Du mais de qualite superieure, cultive avec soin pour offrir des grains tendres, nutritifs et adaptes a de nombreux usages alimentaires.",
  },
  {
    id: "4",
    name: "Manioc",
    slug: "manioc",
    price: "19500",
    compare_at_price: null,
    currency: "FCFA",
    stock_status: "LOW_STOCK",
    avg_rating: 4.6,
    review_count: 98,
    primary_image: maniocImage,
    category_name: "Tubercules",
    description:
      "Du manioc selectionne avec rigueur, apprecie pour sa fraicheur, sa valeur nutritive et sa polyvalence dans de nombreuses recettes africaines.",
  },
];

function formatPrice(value: string, currency: string) {
  return `${new Intl.NumberFormat().format(Number(value))} ${currency}`;
}

export default function HomeTrendingProducts() {
  return (
    <section className="relative overflow-hidden bg-transparent py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-10 h-40 w-40 rounded-full bg-highlight/10 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-52 w-52 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-highlight/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-highlight backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Selection
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Les plus demandes
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
              Une selection rigoureuse de produits qui ont conquis notre communaute.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-highlight/20 hover:text-highlight"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {MOCK_PRODUCTS.map((product, idx) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
              className="group overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_14px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)]"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#faf7f2]">
                  <Image
                    src={product.primary_image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
                      {product.category_name}
                    </span>
                    {product.stock_status === "LOW_STOCK" && (
                      <span className="rounded-full bg-highlight/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-highlight shadow-sm">
                        Dernieres pieces
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${index < Math.floor(product.avg_rating) ? "fill-current" : ""}`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-medium text-gray-700">
                    {product.avg_rating}
                  </span>
                  <span className="text-xs text-gray-400">({product.review_count} avis)</span>
                </div>

                <Link href={`/products/${product.slug}`}>
                  <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                  {product.description}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    {product.compare_at_price && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compare_at_price, product.currency)}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-primary"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Ajouter</span>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            <span>Explorer la collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
