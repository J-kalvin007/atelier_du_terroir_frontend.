"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Apple, Carrot, Rabbit, Star, Heart, ArrowRight } from "lucide-react";
import {
  lapinHeroImage,
  lapinCardImage,
  tomateCardImage,
  pimentShowcaseImage,
  haricotImage,
  oignonsImage,
  poivronsImage,
  maisGridImage,
  chouxImage,
} from "@/assets/images";
import type { StaticImageData } from "next/image";

const FEATURE_ITEMS = [
  {
    icon: Rabbit,
    title: "Le terroir agricole dans toute sa splendeur",
    text: "L'alimentation naturelle est aujourd'hui au coeur de toutes les attentions.",
  },
  {
    icon: Apple,
    title: "Ferme Solime, mangez mieux chaque jour",
    text: "La nutrition biologique s'impose comme un choix essentiel pour une vie saine.",
  },
  {
    icon: Carrot,
    title: "L'authenticite qui se savoure",
    text: "Plus qu'un choix alimentaire, une nouvelle facon de vivre et de consommer.",
  },
] as const;

const VISUAL_CARDS = [
  {
    src: tomateCardImage,
    alt: "Culture maraichere",
    className:
      "left-2 top-10 w-36 sm:left-4 sm:w-44 lg:left-6 lg:top-8 lg:w-48",
    rotate: -4,
    delay: 0.1,
  },
  {
    src: lapinCardImage,
    alt: "Exploitation durable",
    className:
      "right-2 top-1 w-36 sm:right-3 sm:top-0 sm:w-44 lg:right-4 lg:top-0 lg:w-[11.5rem]",
    rotate: 3,
    delay: 0.2,
  },
  {
    src: tomateCardImage,
    alt: "Recolte naturelle",
    className:
      "bottom-2 right-4 w-36 sm:bottom-3 sm:right-5 sm:w-44 lg:bottom-4 lg:right-6 lg:w-[11.5rem]",
    rotate: -2,
    delay: 0.35,
  },
] as const;

type SlideItem = {
  src: StaticImageData;
  alt: string;
  name: string;
  category: string;
};

const SLIDES: SlideItem[] = [
  {
    src: pimentShowcaseImage,
    alt: "piment rouge",
    name: "Piment rouge du terroir",
    category: "Epices",
  },
  {
    src: oignonsImage,
    alt: "oignons",
    name: "Oignons frais de saison",
    category: "Legumes",
  },
  {
    src: haricotImage,
    alt: "haricot",
    name: "Haricots verts biologiques",
    category: "Legumineuses",
  },
  {
    src: maisGridImage,
    alt: "mais",
    name: "Mais dore du plateau",
    category: "Cereales",
  },
  {
    src: poivronsImage,
    alt: "poivrons",
    name: "Poivrons multicolores",
    category: "Epices",
  },
  {
    src: chouxImage,
    alt: "choux",
    name: "Chou frais de maraichage",
    category: "Legumes",
  },
];

function VerticalShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number | null>(null);
  const posRef = useRef(0);

  const SLIDE_HEIGHT = 320;
  const GAP = 20;
  const speed = 0.6;
  const totalHeight = (SLIDE_HEIGHT + GAP) * SLIDES.length;

  const tick = () => {
    if (!isHovering) {
      posRef.current += speed;
      if (posRef.current >= totalHeight) {
        posRef.current -= totalHeight;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${posRef.current}px)`;
      }
    }
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering]);

  const doubled = [...SLIDES, ...SLIDES];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        ref={trackRef}
        className="flex flex-col will-change-transform"
        style={{ gap: `${GAP}px` }}
      >
        {doubled.map((s, i) => (
          <div
            key={i}
            className="relative h-[320px] w-full shrink-0 overflow-hidden rounded-2xl shadow-md"
          >
            <Image src={s.src} alt={s.alt} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="mb-1 text-[10px] uppercase tracking-widest opacity-70">
                {s.category}
              </p>
              <p className="text-base font-medium leading-tight">{s.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgriShowcaseSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Notre promesse
              </p>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                Le terroir agricole dans toute sa splendeur
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
                L&apos;alimentation naturelle est aujourd&apos;hui au coeur de toutes les
                attentions.
              </p>
            </div>

            <div className="space-y-6">
              {FEATURE_ITEMS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.45,
                      delay: 0.08 * index,
                      ease: "easeOut",
                    }}
                    className="flex items-start gap-4 sm:gap-5"
                  >
                    <div
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${
                        item.title.includes("authenticit")
                          ? "border-primary/20 bg-primary/10"
                          : "border-info/20 bg-info/10"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          item.title.includes("authenticit") ? "text-primary" : "text-info"
                        }`}
                        strokeWidth={1.9}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-sans text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
              className="relative max-w-[42rem] overflow-hidden rounded-3xl shadow-2xl"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={lapinHeroImage}
                  alt="Lapin et recolte"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                        Coup de coeur
                      </span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">4.8 ★</span>
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

                  <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <p className="text-2xl font-bold text-white">98K+</p>
                      <p className="text-xs text-white/70">Clients satisfaits</p>
                    </div>
                    <div className="h-8 w-px bg-white/30" />
                    <div>
                      <p className="text-2xl font-bold text-white">4.6 ★</p>
                      <p className="text-xs text-white/70">Avis positifs</p>
                    </div>
                    <div className="h-8 w-px bg-white/30" />
                    <div>
                      <p className="text-2xl font-bold text-white">24/7</p>
                      <p className="text-xs text-white/70">Support local</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-amber-50"
                  >
                    Decouvrir
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  Elevage bio
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-gray-900 shadow-md">
                  Limite
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto w-full max-w-[680px]"
          >
            <div className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[700px]">
              {VISUAL_CARDS.map((card) => (
                <motion.div
                  key={card.alt}
                  initial={{ opacity: 0, y: 24, rotate: card.rotate }}
                  whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
                  whileHover={{
                    y: -6,
                    rotate: card.rotate + 1,
                    transition: { duration: 0.25 },
                  }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.55,
                    delay: card.delay,
                    ease: "easeOut",
                  }}
                  className={`absolute overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(17,24,39,0.12)] ${card.className}`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={card.src} alt={card.alt} fill className="object-cover" />
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-[92%] max-w-[460px] -translate-x-1/2 -translate-y-1/2"
              >
                <VerticalShowcase />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
