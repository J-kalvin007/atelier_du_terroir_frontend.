import Image from "next/image";
import Link from "next/link";
import { legumeImage } from "@/assets/images";

const benefits = ["Frais et naturel", "Production suivie", "Distribution fiable"];

export function LegacyFermeSolime() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-12 h-[34rem] w-[34rem] rounded-[38%_62%_48%_52%/44%_38%_62%_56%] bg-[#4fad28]/12 blur-2xl" />
        <div className="absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-[#ef8219]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#4fad28] shadow-sm">
            🌱 Ferme Solime
          </div>

          <h2 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-[#111111] sm:text-6xl lg:text-7xl">
            FRESH<span className="text-[#4fad28]">&amp;</span>GREEN
          </h2>

          <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-[#4f5d4b] sm:text-base">
            Des produits sains, frais et prets pour le marche local comme international. La Ferme
            Solime cultive, prepare et valorise des produits agricoles avec exigence, regularite et
            respect du vivant.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {benefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-[#33452f] shadow-sm"
              >
                ✓ {benefit}
              </span>
            ))}
          </div>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4fad28] px-6 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(84,121,71,0.28)] hover:bg-[#3d9320]"
          >
            Voir nos produits
          </Link>
        </div>

        <div className="relative min-h-[390px] sm:min-h-[520px]">
          <div className="absolute right-0 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-[41%_59%_54%_46%/48%_38%_62%_52%] bg-[#4fad28]/75 sm:h-[30rem] sm:w-[30rem] lg:h-[34rem] lg:w-[34rem]" />

          <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[12px] border-white bg-white shadow-[0_35px_80px_rgba(35,59,36,0.23)] sm:h-[25rem] sm:w-[25rem] lg:h-[29rem] lg:w-[29rem]">
            <Image
              src={legumeImage}
              alt="Produits frais Ferme Solime"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 460px, 90vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4fad28]/10 via-transparent to-white/10" />
          </div>

          <div className="absolute right-[8%] top-[12%] flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-[#4fad28] shadow-lg backdrop-blur">
            🌿
          </div>
        </div>
      </div>
    </section>
  );
}
