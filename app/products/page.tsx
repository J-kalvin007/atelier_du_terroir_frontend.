import Link from "next/link";
import { ProductsCatalogClient } from "@/components/product/ProductsCatalogClient";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import { LegacyFooter } from "@/components/home/LegacyFooter";

export default function ProductsPage() {
  return (
    <>
      <LegacyHeader />
      <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 pt-28 text-[#1f241c]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[#e7d7c1] bg-[linear-gradient(135deg,#fff8ef_0%,#f7efdf_52%,#edf4ef_100%)] p-8 shadow-[0_24px_70px_rgba(66,49,23,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
                Catalogue complet
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Decouvre les produits de L&apos;Atelier du Terroir
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#586657]">
                La meme logique que l&apos;ancien projet: recherche, categories, tri et affichage
                direct des produits venant de l&apos;API.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
              >
                Retour accueil
              </Link>
            </div>
          </div>
        </section>

        <ProductsCatalogClient />
      </div>
    </main>
      <LegacyFooter />
    </>
  );
}
