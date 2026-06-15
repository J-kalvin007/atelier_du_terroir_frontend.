import Link from "next/link";
import type { PublicCategory } from "@/lib/ecommerce-api";

type CategoriesGridProps = {
  categories: PublicCategory[];
  loading: boolean;
};

const fallbackGradients = [
  "from-[#f8e5c8] to-[#f1d09d]",
  "from-[#d7ead7] to-[#b8d0b8]",
  "from-[#f0ddd8] to-[#e9bfaf]",
  "from-[#dfe7f2] to-[#c7d5e9]",
];

export function CategoriesGrid({ categories, loading }: CategoriesGridProps) {
  const visibleCategories = categories.slice(0, 8);

  return (
    <section className="px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Explorer par categorie
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1d241d] md:text-4xl">
            Les familles de produits disponibles
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5d6a59]">
            Cette section reprend l&apos;esprit de l&apos;ancienne home mais affiche maintenant les
            vraies categories exposees par l&apos;API.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {(loading ? new Array(8).fill(null) : visibleCategories).map((category, index) =>
            category ? (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-[1.9rem] border border-[#e6d8c5] bg-white/88 p-6 shadow-[0_18px_48px_rgba(66,49,23,0.06)] hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(66,49,23,0.1)]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${fallbackGradients[index % fallbackGradients.length]} opacity-55`}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white/80 text-lg font-semibold text-[#1f4d3f] shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1f251f]">{category.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#576654]">
                      {category.description?.trim() || "Voir les produits de cette categorie."}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                    Voir la selection
                  </p>
                </div>
              </Link>
            ) : (
              <div
                key={`category-skeleton-${index}`}
                className="rounded-[1.9rem] border border-[#e6d8c5] bg-white/80 p-6 shadow-[0_18px_48px_rgba(66,49,23,0.06)]"
              >
                <div className="h-14 w-14 animate-pulse rounded-[1.2rem] bg-[#efe6da]" />
                <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-[#efe6da]" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#efe6da]" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#efe6da]" />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
