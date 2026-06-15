import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type {
  ProductListItem,
  PublicBanner,
  PublicFlashSale,
  PublicPromoCode,
} from "@/lib/ecommerce-api";

type TrendingProductsProps = {
  products: ProductListItem[];
  promoCodes: PublicPromoCode[];
  banners: PublicBanner[];
  flashSales: PublicFlashSale[];
  loading: boolean;
};

export function TrendingProducts({
  products,
  promoCodes,
  banners,
  flashSales,
  loading,
}: TrendingProductsProps) {
  const spotlightProducts = products.slice(0, 4);
  const featuredPromo = promoCodes[0];
  const featuredBanner = banners[0];
  const featuredFlashSale = flashSales[0];

  return (
    <section className="relative overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(139,94,52,0.08),_transparent_22%),radial-gradient(circle_at_82%_18%,_rgba(31,77,63,0.08),_transparent_20%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
              Produits tendances
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1d241d] md:text-4xl">
              La vitrine produits de l&apos;ancien projet, branchee a nos vraies donnees
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5d6a59]">
              Les produits ajoutes cote admin peuvent ensuite remonter ici et dans le catalogue
              client selon les endpoints exposes par l&apos;API.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex w-fit items-center rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
          >
            Voir tout le catalogue
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {(loading ? new Array(4).fill(null) : spotlightProducts).map((product, index) =>
              product ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <div
                  key={`trending-skeleton-${index}`}
                  className="overflow-hidden rounded-[1.6rem] border border-[#e8dece] bg-white shadow-[0_18px_60px_rgba(66,49,23,0.08)]"
                >
                  <div className="aspect-square animate-pulse bg-[#efe6da]" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#efe6da]" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#efe6da]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#efe6da]" />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="grid gap-5">
            <article className="rounded-[2rem] bg-[#1f2e26] p-6 text-white shadow-[0_24px_64px_rgba(14,22,18,0.22)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7c39e]">
                Promotion active
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                {loading
                  ? "Chargement des promotions..."
                  : featuredPromo?.code || "Aucun code promo actif pour le moment"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/78">
                {loading
                  ? "Les donnees de promotions arrivent depuis l'API."
                  : featuredPromo?.description ||
                    "Des que les promotions sont disponibles cote backend, elles s'affichent ici."}
              </p>
            </article>

            <article className="rounded-[2rem] border border-[#e4d6c4] bg-white/88 p-6 shadow-[0_20px_52px_rgba(64,47,24,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                Vitrine et urgence commerciale
              </p>
              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Banniere"
                  value={
                    loading
                      ? "Chargement..."
                      : featuredBanner?.title || "Aucune banniere active pour le moment"
                  }
                />
                <InfoRow
                  label="Flash sale"
                  value={
                    loading
                      ? "Chargement..."
                      : featuredFlashSale
                        ? `${featuredFlashSale.product_name} a ${featuredFlashSale.sale_price} FCFA`
                        : "Aucune vente flash active"
                  }
                />
                <InfoRow
                  label="Objectif"
                  value="Donner a la home une vraie communication avec nos APIs ecommerce."
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#eee4d6] bg-[#fbf7f1] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#546250]">{value}</p>
    </div>
  );
}
