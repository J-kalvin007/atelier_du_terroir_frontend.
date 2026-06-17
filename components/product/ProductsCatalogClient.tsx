"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPublicCategories,
  getProducts,
  searchProducts,
  type ProductListItem,
  type PublicCategory,
} from "@/lib/ecommerce-api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Nouveautes" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix decroissant" },
  { value: "-avg_rating", label: "Mieux notes" },
] as const;

function countCategories(categories: PublicCategory[]): number {
  return categories.reduce(
    (total, category) => total + 1 + (category.children ? countCategories(category.children) : 0),
    0
  );
}

function findCategoryBySlug(
  categories: PublicCategory[],
  slug: string
): PublicCategory | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    if (category.children?.length) {
      const match = findCategoryBySlug(category.children, slug);
      if (match) {
        return match;
      }
    }
  }

  return undefined;
}

function collectAncestorIds(categories: PublicCategory[], slug: string): string[] {
  function walk(nodes: PublicCategory[], ancestors: string[]): string[] | null {
    for (const node of nodes) {
      if (node.slug === slug) {
        return ancestors;
      }

      if (node.children?.length) {
        const found = walk(node.children, [...ancestors, node.id]);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  return walk(categories, []) ?? [];
}

type CategoryTreeItemProps = {
  category: PublicCategory;
  depth?: number;
  selectedCategory: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (categoryId: string) => void;
  onSelect: (slug: string) => void;
};

function CategoryTreeItem({
  category,
  depth = 0,
  selectedCategory,
  expandedIds,
  onToggleExpand,
  onSelect,
}: CategoryTreeItemProps) {
  const hasChildren = Boolean(category.children?.length);
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedCategory === category.slug;

  return (
    <li>
      <div
        className="flex items-stretch gap-0.5"
        style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : undefined }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(category.id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Replier ${category.name}` : `Deplier ${category.name}`}
            className="flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
          >
            <ChevronRight
              className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-7 shrink-0" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => onSelect(category.slug)}
          className={cn(
            "min-h-9 flex-1 rounded-lg px-2 py-2 text-left text-sm transition-colors",
            isSelected
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted hover:bg-surface-alt hover:text-foreground"
          )}
        >
          {category.name}
        </button>
      </div>

      {hasChildren && isExpanded ? (
        <ul className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ProductsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("-created_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(() => new Set());
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const data = await getPublicCategories();
        setCategories(data);
        setExpandedCategoryIds(
          new Set(data.filter((category) => category.children?.length).map((category) => category.id))
        );
      } catch {
        setCategories([]);
        setCategoriesError("Impossible de charger les categories depuis le backend.");
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setProductsError(null);
        try {
          if (searchQuery.trim().length >= 3) {
            const data = await searchProducts(searchQuery.trim());
            setProducts(data.results || []);
          } else {
            const data = await getProducts({
              category: selectedCategory || undefined,
              ordering: sortBy,
              page_size: 100,
            });
            setProducts(data.results || []);
          }
        } catch {
          setProducts([]);
          setProductsError("Impossible de charger les produits depuis le backend.");
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && searchQuery.trim().length >= 3) {
      const selectedCategoryName =
        findCategoryBySlug(categories, selectedCategory)?.name.toLowerCase() ?? "";
      result = result.filter(
        (product) => product.category_name?.toLowerCase() === selectedCategoryName
      );
    }

    result = result.filter((product) => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case "price":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "-price":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "-avg_rating":
        result.sort(
          (a, b) =>
            Number(b.avg_rating ?? b.note_produit ?? 0) -
            Number(a.avg_rating ?? a.note_produit ?? 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [categories, priceRange, products, searchQuery, selectedCategory, sortBy]);

  const totalCategoryCount = useMemo(() => countCategories(categories), [categories]);

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSelectCategory = (slug: string | null) => {
    setSelectedCategory(slug);

    if (!slug) {
      return;
    }

    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      collectAncestorIds(categories, slug).forEach((id) => next.add(id));

      const selected = findCategoryBySlug(categories, slug);
      if (selected?.children?.length) {
        next.add(selected.id);
      }

      return next;
    });
  };

  return (
    <div className="page-transition bg-[#fbf7e8]">
      <div className="border-b border-border bg-surface/50 pt-24">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <h1 className="font-display text-3xl font-bold lg:text-4xl">Notre Boutique</h1>
            <p className="mt-2 text-muted">
              Decouvrez notre selection de {filteredProducts.length} produits disponibles
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {categoriesError || productsError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsError || categoriesError}
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {loading ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all lg:hidden",
                showFilters
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/30"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtres
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="appearance-none rounded-xl border border-border bg-surface-elevated py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>

            <div className="hidden items-center rounded-xl border border-border sm:flex">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors",
                  viewMode === "grid" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
                aria-label="Vue grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors",
                  viewMode === "list" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside
            className={cn(
              "w-64 shrink-0 space-y-6 transition-all lg:block",
              showFilters ? "block" : "hidden"
            )}
          >
            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <button
                type="button"
                onClick={() => setCategoriesPanelOpen((current) => !current)}
                className="mb-4 flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={categoriesPanelOpen}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Categories
                </h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
                    categoriesPanelOpen && "rotate-180"
                  )}
                />
              </button>

              {categoriesPanelOpen ? (
                <ul className="space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(null)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        !selectedCategory
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted hover:bg-surface-alt hover:text-foreground"
                      )}
                    >
                      Tous les produits
                    </button>
                  </li>
                  {loadingCategories ? (
                    <li className="px-3 py-2 text-sm text-muted">Chargement...</li>
                  ) : (
                    categories.map((category) => (
                      <CategoryTreeItem
                        key={category.id}
                        category={category}
                        selectedCategory={selectedCategory}
                        expandedIds={expandedCategoryIds}
                        onToggleExpand={toggleCategoryExpand}
                        onSelect={(slug) => handleSelectCategory(slug)}
                      />
                    ))
                  )}
                </ul>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Prix
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={500}
                  value={priceRange[1]}
                  onChange={(event) =>
                    setPriceRange([priceRange[0], parseInt(event.target.value, 10)])
                  }
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{priceRange[0]} FCFA</span>
                  <span>{priceRange[1]} FCFA</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Catalogue
              </h3>
              <div className="space-y-2 text-sm text-muted">
                <p>{totalCategoryCount} categorie(s)</p>
                <p>{products.length} produit(s) charges</p>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="mb-4 text-sm text-muted">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouve
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20"
              >
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="text-lg font-semibold">Aucun produit trouve</p>
                  <p className="mt-1 text-sm text-muted">
                    Essayez de modifier vos filtres ou votre recherche
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleSelectCategory(null);
                    setPriceRange([0, 100000]);
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
                >
                  Reinitialiser les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
