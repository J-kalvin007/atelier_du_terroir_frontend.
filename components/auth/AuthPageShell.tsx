"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import {
  authHeroImage,
  authProduceImage,
  authVegetablesImage,
  authVeganImage,
  logoImage,
  orangeImage,
  pimentHeroImage,
  tomateCardImage,
} from "@/assets/images";

const FLOATING_LEAVES = [
  { className: "left-[4%] top-[12%] h-10 w-10", rotate: -22, delay: 0.1, duration: 5.4 },
  { className: "left-[14%] bottom-[18%] h-12 w-12", rotate: 24, delay: 0.45, duration: 6.1 },
  { className: "right-[10%] top-[20%] h-9 w-9", rotate: 16, delay: 0.8, duration: 5.8 },
  { className: "right-[18%] bottom-[14%] h-14 w-14", rotate: -30, delay: 0.25, duration: 6.4 },
  { className: "left-[42%] top-[8%] h-8 w-8", rotate: 12, delay: 1.1, duration: 5.2 },
] as const;

const FLOATING_PRODUCE = [
  {
    src: authVegetablesImage,
    alt: "Legumes frais",
    className: "absolute left-[-3rem] bottom-[8%] h-44 w-44 sm:h-56 sm:w-56",
    delay: 0.2,
  },
  {
    src: tomateCardImage,
    alt: "Tomates",
    className: "absolute right-[-2rem] top-[14%] h-32 w-32 sm:h-40 sm:w-40",
    delay: 0.5,
  },
  {
    src: pimentHeroImage,
    alt: "Piments",
    className: "absolute right-[8%] bottom-[6%] h-28 w-28 sm:h-36 sm:w-36",
    delay: 0.75,
  },
  {
    src: orangeImage,
    alt: "Oranges",
    className: "absolute left-[8%] top-[18%] h-24 w-24 sm:h-32 sm:w-32",
    delay: 0.35,
  },
  {
    src: authVeganImage,
    alt: "Produits naturels",
    className: "absolute left-[28%] bottom-[4%] hidden h-36 w-36 lg:block",
    delay: 0.9,
  },
] as const;

type AuthPageShellProps = {
  badge: string;
  title?: string;
  description?: string;
  sidePanel: ReactNode;
  formPanel: ReactNode;
};

export function AuthPageShell({
  badge,
  title,
  description,
  sidePanel,
  formPanel,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#1f241c]">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={authHeroImage}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.18]"
          sizes="100vw"
        />
        <Image
          src={authProduceImage}
          alt=""
          fill
          className="object-cover opacity-[0.08] mix-blend-multiply"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.22),_transparent_30%),radial-gradient(circle_at_80%_12%,_rgba(31,77,63,0.18),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.78),_rgba(246,241,232,0.96))]" />
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#dcb98e]/35 blur-3xl" />
        <div className="absolute right-[-7rem] top-40 h-80 w-80 rounded-full bg-[#83a07a]/25 blur-3xl" />

        {FLOATING_LEAVES.map((leaf) => (
          <motion.div
            key={leaf.className}
            className={`absolute text-[#1f4d3f]/55 drop-shadow-sm ${leaf.className}`}
            initial={{ opacity: 0, y: 20, rotate: leaf.rotate }}
            animate={{ opacity: 1, y: [0, -14, 6, 0], x: [0, 8, -6, 0], rotate: leaf.rotate }}
            transition={{
              opacity: { duration: 0.6, delay: leaf.delay },
              y: { duration: leaf.duration, repeat: Infinity, ease: "easeInOut", delay: leaf.delay },
              x: { duration: leaf.duration + 1, repeat: Infinity, ease: "easeInOut", delay: leaf.delay },
            }}
          >
            <Leaf className="h-full w-full fill-current" />
          </motion.div>
        ))}

        {FLOATING_PRODUCE.map((item) => (
          <motion.div
            key={item.className}
            className={`${item.className} opacity-[0.22]`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 0.22, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.8, delay: item.delay },
              scale: { duration: 0.8, delay: item.delay },
              y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            }}
          >
            <Image src={item.src} alt={item.alt} fill className="object-contain drop-shadow-xl" sizes="240px" />
          </motion.div>
        ))}
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d9c5aa] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b5e34] shadow-sm backdrop-blur">
            <Sprout className="h-4 w-4 text-[#1f4d3f]" />
            {badge}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg">
              <Image src={logoImage} alt="Atelier du Terroir" fill className="object-contain p-2" sizes="64px" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                Atelier du Terroir
              </p>
              <p className="text-sm text-[#5a6755]">Agriculture d&apos;avenir</p>
            </div>
          </div>

          {title || description ? (
            <div className="space-y-6">
              {title ? (
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="max-w-2xl text-lg leading-8 text-[#52604e]">{description}</p>
              ) : null}
            </div>
          ) : null}

          {sidePanel}
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0">{formPanel}</div>
      </section>
    </main>
  );
}
