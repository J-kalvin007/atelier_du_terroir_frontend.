"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Package, Tags } from "lucide-react";

type ProductsPageHeaderProps = {
  productCount: number;
  categoryCount: number;
};

function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-[108px] items-center gap-3 rounded-xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4 text-primary-light" strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
          {label}
        </p>
      </div>
    </div>
  );
}

export function ProductsPageHeader({ productCount, categoryCount }: ProductsPageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-highlight pt-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(239,130,25,0.14),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.07),transparent_32%)]" />

      <div className="relative mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-9 md:py-10">
        <motion.nav
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Fil d'Ariane"
          className="mb-5 flex items-center gap-1.5 text-xs text-white/50"
        >
          <Link href="/" className="transition-colors hover:text-white/80">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
          <span className="font-medium text-white/88">Boutique</span>
        </motion.nav>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="max-w-2xl"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-light">
              Catalogue produits
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-[2.35rem]">
              Notre Boutique
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-white/72 md:text-[15px]">
              Parcourez notre selection de produits du terroir — fruits, legumes, epices et
              produits transformes, disponibles pour la livraison.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="flex shrink-0 flex-wrap gap-3"
          >
            <StatBadge icon={Package} label="Produits" value={productCount} />
            <StatBadge icon={Tags} label="Categories" value={categoryCount} />
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />
    </section>
  );
}
