import type { Metadata } from "next";
import AboutPageContent from "@/components/about/AboutPageContent";
import { LegacyFooter } from "@/components/home/LegacyFooter";
import { LegacyHeader } from "@/components/home/LegacyHeader";

export const metadata: Metadata = {
  title: "A propos — Atelier du Terroir",
  description:
    "Decouvrez la Ferme Solime, notre chaine de valeur agricole et notre engagement pour des produits sains du champ a votre table.",
};

export default function AboutPage() {
  return (
    <>
      <LegacyHeader />
      <main>
        <AboutPageContent />
      </main>
      <LegacyFooter />
    </>
  );
}
