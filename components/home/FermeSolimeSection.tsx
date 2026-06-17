"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Leaf, Sprout } from "lucide-react";
import { legumeImage } from "@/assets/images";

const LEAVES = [
  { className: "left-[7%] top-[14%] h-9 w-9", rotate: -18, delay: 0.1, duration: 5.2 },
  { className: "left-[18%] bottom-[16%] h-10 w-10", rotate: 28, delay: 0.7, duration: 6 },
  { className: "left-[43%] bottom-[10%] h-16 w-16", rotate: -34, delay: 0.35, duration: 5.7 },
  { className: "right-[8%] top-[18%] h-8 w-8", rotate: 18, delay: 1, duration: 5.4 },
] as const;

const BENEFITS = ["Frais et naturel", "Production suivie", "Distribution fiable"] as const;

export default function FermeSolimeSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-12 h-[34rem] w-[34rem] rounded-[38%_62%_48%_52%/44%_38%_62%_56%] bg-primary/12 blur-2xl" />
        <div className="absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-[#ef8219]/10 blur-3xl" />

        {LEAVES.map((leaf) => (
          <motion.div
            key={leaf.className}
            className={`absolute text-primary/70 drop-shadow-lg ${leaf.className}`}
            initial={{ opacity: 0, y: 24, rotate: leaf.rotate }}
            whileInView={{ opacity: 1, y: 0, rotate: leaf.rotate }}
            animate={{ y: [0, -16, 8, 0], x: [0, 10, -6, 0] }}
            viewport={{ once: true }}
            transition={{
              opacity: { duration: 0.5, delay: leaf.delay },
              y: {
                duration: leaf.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: leaf.delay,
              },
              x: {
                duration: leaf.duration + 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: leaf.delay,
              },
            }}
          >
            <Leaf className="h-full w-full fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial={{ opacity: 0, x: -34 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm">
            <Sprout className="h-4 w-4" />
            Ferme Solime
          </div>

          <h2 className="max-w-xl font-display text-5xl font-black leading-[0.95] tracking-tight text-[#111111] sm:text-6xl lg:text-7xl">
            FRESH<span className="text-primary">&amp;</span>GREEN
          </h2>

          <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-[#4f5d4b] sm:text-base">
            Des produits sains, frais et prets pour le marche local comme international. La Ferme
            Solime cultive, prepare et valorise des produits agricoles avec exigence, regularite et
            respect du vivant.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {BENEFITS.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-[#33452f] shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {benefit}
              </span>
            ))}
          </div>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(84,121,71,0.28)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Voir nos produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 34 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-[390px] sm:min-h-[520px]"
        >
          <motion.div
            animate={{
              borderRadius: [
                "41% 59% 54% 46% / 48% 38% 62% 52%",
                "55% 45% 42% 58% / 40% 58% 42% 60%",
                "41% 59% 54% 46% / 48% 38% 62% 52%",
              ],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 bg-primary/75 sm:h-[30rem] sm:w-[30rem] lg:h-[34rem] lg:w-[34rem]"
          />

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[12px] border-white bg-white shadow-[0_35px_80px_rgba(35,59,36,0.23)] sm:h-[25rem] sm:w-[25rem] lg:h-[29rem] lg:w-[29rem]"
          >
            <Image
              src={legumeImage}
              alt="Produits frais Ferme Solime"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 460px, 90vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-white/10" />
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute right-[8%] top-[12%] flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-primary shadow-lg backdrop-blur"
          >
            <Leaf className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
