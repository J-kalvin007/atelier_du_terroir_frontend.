import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { pimentHeroImage, poivronsImage, tomateHeroImage } from "@/assets/images";

type HeroSectionProps = {
  authSlot: ReactNode;
};

const sellingPoints = [
  "Produits locaux, transformes et exportables",
  "Une seule page de connexion pour admin et client",
  "Catalogue, promotions, livraison et wallet relies aux API",
];

const quickStats = [
  { label: "Espaces", value: "Admin + Client" },
  { label: "Auth", value: "Partagee" },
  { label: "Acces", value: "Par role API" },
];

const heroImages = [
  { src: tomateHeroImage, alt: "Tomates du terroir" },
  { src: pimentHeroImage, alt: "Piments du terroir" },
  { src: poivronsImage, alt: "Poivrons du terroir" },
];

export function HeroSection({ authSlot }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-8 lg:pb-16 lg:pt-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.22),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(31,77,63,0.18),_transparent_22%),linear-gradient(180deg,_rgba(255,251,244,0.9),_rgba(246,241,232,0.98))]" />
      <div className="absolute left-[-7rem] top-14 h-64 w-64 rounded-full bg-[#d8b184]/30 blur-3xl" />
      <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-[#7ea183]/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c6ac] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#8b5e34] shadow-sm backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f4d3f]" />
            L&apos;Atelier du Terroir
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6f7a63]">
              Le terroir agricole dans toute sa splendeur
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight text-[#1b221a] md:text-6xl xl:text-7xl">
              Des produits sains, frais et prets pour le marche local comme international.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#52604e]">
              Retrouve la logique de l&apos;ancien projet sur notre application actuelle:
              une grande page d&apos;accueil inspiree de la vitrine precedente, avec la meme
              connexion commune puis une redirection automatique vers `/admin` ou `/client`.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-[#1f4d3f] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(31,77,63,0.24)] hover:bg-[#173a30]"
            >
              Explorer la boutique
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-[#d2bea3] bg-white/70 px-6 py-3 text-sm font-semibold text-[#8b5e34] hover:border-[#8b5e34] hover:bg-white"
            >
              Creer un compte
            </Link>
            <a
              href="#connexion"
              className="rounded-full border border-[#d7ddcf] px-6 py-3 text-sm font-semibold text-[#243327] hover:border-[#1f4d3f] hover:text-[#1f4d3f]"
            >
              Se connecter
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickStats.map((item) => (
              <article
                key={item.label}
                className="rounded-[1.6rem] border border-[#e5d8c7] bg-white/82 p-5 shadow-[0_18px_44px_rgba(61,44,21,0.08)] backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                  {item.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-[#1c241b]">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-[#e6d7c2] bg-[#fffdfa] p-6 shadow-[0_24px_64px_rgba(66,49,23,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                Ce que tu retrouves ici
              </p>
              <div className="mt-5 space-y-3">
                {sellingPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.25rem] border border-[#efe4d6] bg-[#fbf7f1] px-4 py-4 text-sm leading-6 text-[#4e5b4b]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-[#1f2e26] p-6 text-white shadow-[0_24px_64px_rgba(14,22,18,0.22)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7c39e]">
                Connexion intelligente
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight">
                Une seule authentification, puis le backend decide l&apos;espace d&apos;arrivee.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Un compte admin arrive sur le tableau de bord admin. Un compte client arrive sur
                l&apos;espace client. La page de connexion reste la meme pour les deux.
              </p>
            </section>
          </div>
        </div>

        <div id="connexion" className="relative">
          <div className="absolute inset-x-10 top-8 h-28 rounded-full bg-[#8b5e34]/18 blur-3xl" />
          <div className="mb-5 grid grid-cols-3 gap-3">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-[1.8rem] border border-white/40 bg-white/75 shadow-[0_18px_44px_rgba(66,49,23,0.14)] ${
                  index === 0 ? "col-span-3 aspect-[2.1/1]" : "aspect-[0.95/1.05]"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 1024px) 100vw, 520px" : "220px"}
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
            ))}
          </div>
          {authSlot}
        </div>
      </div>
    </section>
  );
}
