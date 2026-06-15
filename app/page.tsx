import { LegacyAgriShowcase } from "@/components/home/LegacyAgriShowcase";
import { LegacyFeatures } from "@/components/home/LegacyFeatures";
import { LegacyFermeSolime } from "@/components/home/LegacyFermeSolime";
import { LegacyFooter } from "@/components/home/LegacyFooter";
import { LegacyHeader } from "@/components/home/LegacyHeader";
import { LegacyHero } from "@/components/home/LegacyHero";

export default function HomePage() {
  return (
    <>
      <LegacyHeader />
      <main className="bg-[#fbf7e8] text-[#1f241c]">
        <LegacyHero />
        <LegacyAgriShowcase />
        <LegacyFermeSolime />
        <LegacyFeatures />
      </main>
      <LegacyFooter />
    </>
  );
}
