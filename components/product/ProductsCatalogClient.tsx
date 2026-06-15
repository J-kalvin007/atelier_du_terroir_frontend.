"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getProducts,
  searchProducts,
  type ProductListItem,
  type PublicCategory,
} from "@/lib/ecommerce-api";
import { ProductCard } from "@/components/product/ProductCard";

const sortOptions = [
  { value: "-created_at", label: "Nouveautes" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix decroissant" },
  { value: "-avg_rating", label: "Mieux notes" },
];

export function ProductsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("-created_at");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const data = await getCategories();
        if (!active) {
          return;
        }

        setCategories(data);
        setCategoriesError(null);
      } catch {
        if (!active) {
          return;
        }

        setCategories([]);
        setCategoriesError("Impossible de charger les categories.");
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          setLoadingProducts(true);

          if (searchQuery.trim().length >= 3) {
            const data = await searchProducts(searchQuery.trim());
            if (!active) {
              return;
            }

            setProducts(data.results);
            setProductsError(null);
            return;
          }

          const data = await getProducts({
            category: selectedCategory || undefined,
            ordering: sortBy,
            page_size: 100,
          });

          if (!active) {
            return;
          }

          setProducts(data.results);
          setProductsError(null);
        } catch {
          if (!active) {
            return;
          }

          setProducts([]);
          setProductsError("Impossible de charger les produits.");
        } finally {
          if (active) {
            setLoadingProducts(false);
          }
        }
      })();
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && searchQuery.trim().length >= 3) {
      const categoryName =
        categories.find((category) => category.slug === selectedCategory)?.name.toLowerCase() ?? "";

      result = result.filter(
        (product) => product.category_name?.toLowerCase() === categoryName
      );
    }

    result = result.filter((product) => Number(product.price) <= maxPrice);

    switch (sortBy) {
      case "price":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "-price":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "-avg_rating":
        result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
        break;
      default:
        break;
    }

    return result;
  }, [categories, maxPrice, products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {productsError || categoriesError ? (
        <div className="rounded-[1.4rem] border border-[#e6cdb7] bg-[#fff6ee] px-4 py-4 text-sm text-[#7b532b]">
          {productsError || categoriesError}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-[2rem] border border-[#e8dece] bg-white p-5 shadow-[0_18px_60px_rgba(66,49,23,0.08)] lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
            Recherche
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un produit..."
            className="min-h-[3.2rem] rounded-[1rem] border border-[#e6d9c9] bg-[#fffdfa] px-4 py-3 text-sm text-[#1f241c] outline-none focus:border-[#8b5e34]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
            Categorie
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="min-h-[3.2rem] rounded-[1rem] border border-[#e6d9c9] bg-[#fffdfa] px-4 py-3 text-sm text-[#1f241c] outline-none focus:border-[#8b5e34]"
          >
            <option value="">Toutes les categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
            Tri
          </span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="min-h-[3.2rem] rounded-[1rem] border border-[#e6d9c9] bg-[#fffdfa] px-4 py-3 text-sm text-[#1f241c] outline-none focus:border-[#8b5e34]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-4 rounded-[2rem] border border-[#e8dece] bg-white p-5 shadow-[0_18px_60px_rgba(66,49,23,0.08)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
              Prix maximum
            </p>
            <input
              type="range"
              min={0}
              max={100000}
              step={500}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="mt-4 w-full accent-[#1f4d3f]"
            />
            <p className="mt-2 text-sm text-[#5d6b58]">{maxPrice} FCFA</p>
          </div>

          <div className="rounded-[1.25rem] border border-[#efe4d6] bg-[#fbf7f1] px-4 py-4 text-sm text-[#5d6b58]">
            {loadingCategories ? "Chargement des categories..." : `${categories.length} categorie(s)`}
          </div>
          <div className="rounded-[1.25rem] border border-[#efe4d6] bg-[#fbf7f1] px-4 py-4 text-sm text-[#5d6b58]">
            {loadingProducts ? "Chargement des produits..." : `${filteredProducts.length} produit(s)`}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#5d6b58]">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouve
              {filteredProducts.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSortBy("-created_at");
                setMaxPrice(100000);
              }}
              className="rounded-full border border-[#d8c4ab] px-4 py-2 text-sm font-semibold text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
            >
              Reinitialiser
            </button>
          </div>

          {loadingProducts ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {new Array(6).fill(null).map((_, index) => (
                <div
                  key={`catalog-skeleton-${index}`}
                  className="overflow-hidden rounded-[1.6rem] border border-[#e8dece] bg-white shadow-[0_18px_60px_rgba(66,49,23,0.08)]"
                >
                  <div className="aspect-square animate-pulse bg-[#efe6da]" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#efe6da]" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#efe6da]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#efe6da]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d9c5aa] bg-[#fffdfa] px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-[#1f241c]">Aucun produit trouve</h2>
              <p className="mt-3 text-sm text-[#5d6b58]">
                Essaie de modifier la recherche, la categorie ou le prix maximum.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
