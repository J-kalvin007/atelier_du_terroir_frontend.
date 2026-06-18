"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import {
  chouxImage,
  haricotImage,
  maisGridImage,
  oignonsImage,
  pimentShowcaseImage,
  poivronsImage,
  tomateCardImage,
} from "@/assets/images";
import type { StaticImageData } from "next/image";

const PILLARS = [
  {
    index: "01",
    title: "Le terroir agricole dans toute sa splendeur",
    text: "L'alimentation naturelle est au coeur de toutes les attentions.",
    quote: false,
  },
  {
    index: "02",
    title: "Ferme Solime, mangez mieux chaque jour",
    text: "La nutrition biologique pour une vie saine.",
    quote: false,
  },
  {
    index: "03",
    title: "L'authenticite qui se savoure",
    text: "Une nouvelle facon de vivre et de consommer.",
    quote: true,
  },
] as const;

function OrganicBlob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 360"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M320 40C360 90 380 160 350 230C320 300 250 340 170 330C90 320 20 260 30 180C40 100 110 30 190 25C270 20 280 0 320 40Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PathMarker({ index }: { index: string }) {
  return (
    <span className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[11px] font-black tracking-wider text-primary shadow-[0_0_0_6px_rgba(239,130,25,0.1),0_8px_20px_rgba(52,76,61,0.08)] ring-1 ring-primary/20">
      {index}
      <span className="absolute inset-0 rounded-full bg-primary/15 blur-md" aria-hidden="true" />
    </span>
  );
}

function PillarCopy({
  pillar,
  align,
}: {
  pillar: (typeof PILLARS)[number];
  align: "left" | "right";
}) {
  const aligned = align === "right" ? "md:text-right" : "md:text-left";

  if (pillar.quote) {
    return (
      <div className={`relative ${aligned}`}>
        <span
          className="pointer-events-none absolute -top-2 font-display text-4xl leading-none text-primary/35 md:text-5xl"
          style={align === "right" ? { right: 0 } : { left: 0 }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <h3 className="relative pt-4 font-display text-lg font-bold leading-snug text-primary sm:text-xl">
          {pillar.title}
        </h3>
        <p className="relative mt-2 text-sm leading-7 text-primary/80">{pillar.text}</p>
        <span
          className="pointer-events-none absolute -bottom-4 font-display text-4xl leading-none text-primary/35 md:text-5xl"
          style={align === "right" ? { left: "1rem" } : { right: 0 }}
          aria-hidden="true"
        >
          &rdquo;
        </span>
      </div>
    );
  }

  return (
    <div className={aligned}>
      <h3 className="font-display text-lg font-bold leading-snug text-primary sm:text-xl">
        {pillar.title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-primary/80">{pillar.text}</p>
    </div>
  );
}

function CurvedJourneyPath({ className }: { className?: string }) {
  return (
    <svg
      className={`text-highlight/25 ${className ?? ""}`}
      viewBox="0 0 900 500"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 110 65 C 210 35, 360 95, 490 155 C 620 215, 760 285, 710 355 C 660 415, 420 455, 185 475"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 10"
        strokeLinecap="round"
        className="hidden md:block"
      />
      <path
        d="M 28 30 C 28 110, 52 170, 28 230 C 28 290, 52 350, 28 430"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 10"
        strokeLinecap="round"
        className="md:hidden"
      />
    </svg>
  );
}

const JOURNEY_STOPS = [
  { x: "12%", y: "13%", textSide: "left" as const },
  { x: "79%", y: "71%", textSide: "right" as const },
  { x: "21%", y: "92%", textSide: "left" as const },
] as const;

const MOBILE_STOPS = [{ y: "8%" }, { y: "46%" }, { y: "84%" }] as const;

function PillarsJourney() {
  return (
    <div className="relative mx-auto mt-12 max-w-5xl lg:mt-16">
      <OrganicBlob className="pointer-events-none absolute -left-20 top-0 h-44 w-44 text-primary-light/80" />
      <OrganicBlob className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 text-surface-alt" />

      <CurvedJourneyPath className="pointer-events-none absolute inset-0 h-full w-full" />

      <ul className="relative min-h-[420px] md:hidden">
        {PILLARS.map((pillar, index) => (
          <motion.li
            key={pillar.index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="absolute left-0 right-0 px-1"
            style={{ top: MOBILE_STOPS[index].y }}
          >
            <div className="flex items-start gap-4 pl-0">
              <PathMarker index={pillar.index} />
              <div className="min-w-0 flex-1 pt-0.5">
                <PillarCopy pillar={pillar} align="left" />
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="relative hidden min-h-[500px] md:block">
        {PILLARS.map((pillar, index) => {
          const stop = JOURNEY_STOPS[index];
          const isTextRight = stop.textSide === "right";

          return (
            <motion.div
              key={pillar.index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <div
                className="absolute z-10"
                style={{
                  left: stop.x,
                  top: stop.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <PathMarker index={pillar.index} />
              </div>

              <div
                className="absolute max-w-[300px] lg:max-w-[340px]"
                style={{
                  left: stop.x,
                  top: stop.y,
                  transform: isTextRight
                    ? "translate(36px, -50%)"
                    : "translate(calc(-100% - 36px), -50%)",
                }}
              >
                <PillarCopy pillar={pillar} align={isTextRight ? "left" : "right"} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[8%] top-[38%] hidden text-primary/35 md:block"
      >
        <Leaf className="h-5 w-5" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
        className="pointer-events-none absolute left-[10%] top-[62%] hidden text-highlight/25 md:block"
      >
        <Leaf className="h-4 w-4" />
      </motion.div>
    </div>
  );
}

function VerticalImageCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const posRef = useRef(0);

  const SLIDE_HEIGHT = 220;
  const GAP = 16;
  const speed = 0.45;
  const slides: { src: StaticImageData; alt: string }[] = [
    { src: pimentShowcaseImage, alt: "Piments du terroir" },
    { src: tomateCardImage, alt: "Tomates fraiches" },
    { src: oignonsImage, alt: "Oignons de saison" },
    { src: haricotImage, alt: "Haricots verts" },
    { src: poivronsImage, alt: "Poivrons" },
    { src: maisGridImage, alt: "Mais dore" },
    { src: chouxImage, alt: "Choux frais" },
  ];
  const totalHeight = (SLIDE_HEIGHT + GAP) * slides.length;

  useEffect(() => {
    const tick = () => {
      if (!paused && trackRef.current) {
        posRef.current += speed;
        if (posRef.current >= totalHeight) {
          posRef.current -= totalHeight;
        }
        trackRef.current.style.transform = `translate3d(0, -${posRef.current}px, 0)`;
      }
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [paused, totalHeight]);

  const loopSlides = [...slides, ...slides];

  return (
    <div
      className="relative z-[1] h-[88%] w-[82%] overflow-hidden rounded-[2rem] bg-background/95 shadow-[0_20px_48px_rgba(52,76,61,0.1)] ring-1 ring-border-subtle backdrop-blur-[2px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carrousel produits"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-b from-transparent to-background" />

      <div
        ref={trackRef}
        className="flex flex-col will-change-transform"
        style={{ gap: `${GAP}px`, padding: "8px" }}
      >
        {loopSlides.map((slide, index) => (
          <div
            key={`${slide.alt}-${index}`}
            className="relative shrink-0 overflow-hidden rounded-[1.35rem] bg-surface-elevated shadow-sm ring-1 ring-border-subtle"
            style={{ height: `${SLIDE_HEIGHT}px` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 85vw, 360px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductShowcase() {
  return (
    <div className="relative flex aspect-[4/5] w-full min-h-[400px] max-w-[520px] items-center justify-center overflow-visible sm:min-h-[460px] lg:max-w-[600px] lg:min-h-[540px]">
      <OrganicBlob className="pointer-events-none absolute left-1/2 top-1/2 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 text-primary-light sm:h-[165%] sm:w-[165%] lg:h-[175%] lg:w-[175%]" />

      <VerticalImageCarousel />

      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[6%] top-[6%] z-20 text-highlight/30 lg:right-[2%]"
      >
        <Leaf className="h-9 w-9 lg:h-10 lg:w-10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.6 }}
        className="pointer-events-none absolute bottom-[12%] left-[4%] z-20 text-primary/35 lg:left-0"
      >
        <Leaf className="h-7 w-7 lg:h-8 lg:w-8" />
      </motion.div>
    </div>
  );
}

export default function AgriShowcaseSection() {
  return (
    <section className="relative overflow-x-clip overflow-y-visible bg-background py-12 sm:py-14 lg:py-16">
      <OrganicBlob className="pointer-events-none absolute -left-24 top-0 h-64 w-64 text-primary-light/50" />
      <OrganicBlob className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 text-surface-alt/80" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 overflow-visible lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-xl space-y-5 lg:mx-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-highlight shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Notre promesse
            </div>

            <h2 className="font-display text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl">
              Le terroir agricole
              <span className="block text-highlight">dans toute sa splendeur</span>
            </h2>

            <p className="text-sm leading-7 text-muted sm:text-base">
              L&apos;alimentation naturelle est aujourd&apos;hui au coeur de toutes les attentions.
              Atelier du Terroir et Ferme Solime vous rapprochent du meilleur de la production locale.
            </p>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(239,130,25,0.3)] transition hover:bg-primary-active"
            >
              Decouvrir la boutique
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto flex w-full max-w-[520px] justify-center overflow-visible lg:max-w-[620px] lg:justify-end"
          >
            <ProductShowcase />
          </motion.div>
        </div>

        <PillarsJourney />
      </div>
    </section>
  );
}
