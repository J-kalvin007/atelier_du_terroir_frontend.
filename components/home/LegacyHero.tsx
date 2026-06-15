"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pimentHeroImage, poivronsImage, tomateHeroImage } from "@/assets/images";

const heroImages = [tomateHeroImage, pimentHeroImage, poivronsImage];

const rotatingTexts = [
  {
    title: "Cultives avec respect",
    body: "Nos produits sont cultives et prepares selon des pratiques responsables et durables.",
  },
  {
    title: "Le meilleur du terroir",
    body: "Fruits, produits transformes et articles exportes valorisent la qualite locale.",
  },
  {
    title: "Une vitrine moderne",
    body: "Une page d'accueil plus proche de l'ancien projet avec une authentification commune a part.",
  },
];

export function LegacyHero() {
  const [imageIndex, setImageIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const imageInterval = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % heroImages.length);
    }, 4500);

    const textInterval = window.setInterval(() => {
      setTextIndex((current) => (current + 1) % rotatingTexts.length);
    }, 8000);

    return () => {
      window.clearInterval(imageInterval);
      window.clearInterval(textInterval);
    };
  }, []);

  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      <div className="absolute inset-0">
        {heroImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === imageIndex ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[1.03]"
            }`}
          >
            <Image
              src={src}
              alt={`Visuel hero ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17331d]/88 via-[#1f4b2d]/54 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(194,230,98,0.12),transparent_50%)]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-0 overflow-hidden px-4">
        <p className="select-none text-center text-[2.3rem] font-black uppercase tracking-[0.14em] text-white/10 sm:text-[4rem] lg:text-[6rem]">
          ATELIER DU TERROIR
        </p>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[95vh] max-w-7xl items-center px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid w-full items-start gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef8219]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/90 sm:text-xs">
                Le terroir agricole dans toute sa splendeur
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-xl sm:text-5xl lg:text-6xl xl:text-7xl">
                Atelier du Terroir
              </h1>
              <p className="max-w-xl text-xl font-medium leading-snug tracking-wide text-white/95 sm:text-2xl lg:text-[2rem]">
                Des produits sains, frais et prets pour le monde.
              </p>
              <p className="max-w-2xl text-base leading-8 text-white/82">
                A l&apos;atelier du terroir, nos produits sont cultives et eleves selon des
                methodes respectueuses de l&apos;environnement et de l&apos;agriculture durable.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link
                href="/products"
                className="rounded-2xl bg-[#ef8219] px-7 py-3.5 text-base font-bold text-white shadow-xl hover:bg-[#d96f13] sm:text-lg"
              >
                Explorer la Boutique
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md hover:bg-white/20 sm:text-lg"
              >
                Se connecter
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-4">
              {heroImages.map((_, index) => (
                <button
                  key={`hero-bullet-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    imageIndex === index ? "w-8 bg-[#ef8219]" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Afficher l'image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end lg:pt-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-md lg:max-w-md lg:p-7">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#ef8219]/20 blur-3xl" />

              <div className="relative border-l-4 border-[#ef8219] pl-5">
                <p className="text-2xl font-semibold italic leading-tight text-[#efc787] sm:text-3xl lg:text-[2.6rem]">
                  L&apos;authenticite qui se savoure
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-px w-8 bg-white/40" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-[11px]">
                    Plus qu&apos;un choix alimentaire, une nouvelle facon de vivre.
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative min-h-[190px] rounded-2xl bg-black/20 p-5 text-center">
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#efc787] sm:text-base">
                    {rotatingTexts[textIndex].title}
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-white sm:text-[15px]">
                    {rotatingTexts[textIndex].body}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {rotatingTexts.map((_, idx) => (
                      <span
                        key={`text-bullet-${idx}`}
                        className={`h-1 w-4 rounded-full ${
                          textIndex === idx ? "bg-[#ef8219]" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
