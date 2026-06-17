import type { Metadata } from "next";
import AgriShowcaseSection from "@/components/home/AgriShowcaseSection";
import FermeSolimeSection from "@/components/home/FermeSolimeSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import HomeTrendingProducts from "@/components/home/HomeTrendingProducts";
import { LegacyFooter } from "@/components/home/LegacyFooter";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustBand from "@/components/home/TrustBand";

export const metadata: Metadata = {
  title: "Atelier du Terroir — Produits agricoles frais et authentiques",
  description:
    "Decouvrez les meilleurs produits du terroir : fruits frais, viande blanche, epices et produits transformes. Livraison locale et internationale, wallet integre, programme de fidelite.",
};

export default function HomePage() {
  return (
    <>
      <LegacyHeader />
      <main className="page-transition bg-[#fbf7e8] text-[#1f241c]">
        <HeroSection />
        <TrustBand />
        <AgriShowcaseSection />
        <HomeTrendingProducts />
        <FermeSolimeSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <LegacyFooter />
    </>
  );
}
