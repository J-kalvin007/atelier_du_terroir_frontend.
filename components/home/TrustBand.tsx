"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "1200+", label: "Producteurs partenaires" },
  { value: "8500+", label: "References produits" },
  { value: "42", label: "Pays d'export" },
  { value: "4.9/5", label: "Satisfaction client" },
] as const;

const MARQUEE_ITEMS = [
  "Livraison gratuite",
  "Assistance 24h/24, 7j/7",
  "Paiement securise",
  "Produits 100% bio",
] as const;

export default function TrustBand() {
  const loopingItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-2 divide-x divide-[#eadfce] md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="flex flex-col items-center justify-center px-4 py-6 text-center"
            >
              <p className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden bg-primary text-white">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-center"
        >
          {loopingItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-4 px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] sm:px-10 sm:text-base"
            >
              <span>{item}</span>
              <span className="text-[#c2e662]">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
