import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  chouxImage,
  haricotImage,
  lapinCardImage,
  lapinHeroImage,
  maisGridImage,
  oignonsImage,
  pimentShowcaseImage,
  poivronsImage,
  tomateCardImage,
} from "@/assets/images";

const featureItems = [
  {
    icon: "🐇",
    title: "Le terroir agricole dans toute sa splendeur",
    text: "L'alimentation naturelle est aujourd'hui au coeur de toutes les attentions.",
  },
  {
    icon: "🍎",
    title: "Ferme Solime, mangez mieux chaque jour",
    text: "La nutrition biologique s'impose comme un choix essentiel pour une vie saine.",
  },
  {
    icon: "🥕",
    title: "L'authenticite qui se savoure",
    text: "Plus qu'un choix alimentaire, une nouvelle facon de vivre et de consommer.",
  },
];

const slides = [
  { src: pimentShowcaseImage, alt: "Piment rouge", name: "Piment rouge du terroir", category: "Epices" },
  { src: oignonsImage, alt: "Oignons", name: "Oignons frais de saison", category: "Legumes" },
  { src: haricotImage, alt: "Haricots", name: "Haricots verts biologiques", category: "Legumineuses" },
  { src: maisGridImage, alt: "Mais", name: "Mais dore du plateau", category: "Cereales" },
  { src: poivronsImage, alt: "Poivrons", name: "Poivrons multicolores", category: "Epices" },
  { src: chouxImage, alt: "Choux", name: "Chou frais de maraichage", category: "Legumes" },
];

export function LegacyAgriShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-14">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4fad28]">
                Notre promesse
              </p>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                Le terroir agricole dans toute sa splendeur
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-[#596657] sm:text-lg">
                L&apos;alimentation naturelle est aujourd&apos;hui au coeur de toutes les attentions.
              </p>
            </div>

            <div className="space-y-6">
              {featureItems.map((item) => (
                <div key={item.title} className="flex items-start gap-4 sm:gap-5">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#4fad28]/20 bg-[#4fad28]/10 text-xl shadow-sm">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-semibold leading-tight text-[#1f251f] sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#5a6755] sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative max-w-[42rem] overflow-hidden rounded-3xl shadow-2xl">
              <div className="relative aspect-[16/9] w-full">
                <Image src={lapinHeroImage} alt="Lapin et recolte" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-rose-400">♥</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                        Coup de coeur
                      </span>
                    </div>
                    <div className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      4.8 ★
                    </div>
                  </div>

                  <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    Nature pure
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-semibold text-amber-300">Frais local</span>
                    <span className="text-sm text-white/60 line-through">Produit standard</span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">
                      -15%
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-6">
                    <Stat value="98K+" label="Clients satisfaits" />
                    <Stat value="4.6 ★" label="Avis positifs" />
                    <Stat value="24/7" label="Support local" />
                  </div>

                  <Link
                    href="/products"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg hover:bg-amber-50"
                  >
                    Decouvrir
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <ShowcaseImage src={tomateCardImage} alt="Culture maraichere" />
              <ShowcaseImage src={lapinCardImage} alt="Exploitation durable" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {slides.map((slide) => (
                <div key={slide.name} className="relative h-[260px] overflow-hidden rounded-2xl shadow-md">
                  <Image src={slide.src} alt={slide.alt} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="mb-1 text-[10px] uppercase tracking-widest opacity-70">
                      {slide.category}
                    </p>
                    <p className="text-base font-medium leading-tight">{slide.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseImage({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <div className="relative aspect-[1/1.1] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(17,24,39,0.12)]">
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
