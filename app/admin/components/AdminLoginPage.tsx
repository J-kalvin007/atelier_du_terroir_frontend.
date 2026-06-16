"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { buildAdminReturnPath } from "@/lib/auth";
import type { AdminSectionId } from "../AdminDashboard";

const SECTION_LABELS: Record<AdminSectionId, string> = {
  analytics: "Analytics",
  audit: "Audit",
  banners: "Bannieres",
  overview: "Dashboard",
  products: "Produits",
  categories: "Categories",
  orders: "Commandes",
  clients: "Clients",
  promotions: "Promotions",
  loyalty: "Fidelite",
  wallet: "Wallet",
  settings: "Parametres",
};

export default function AdminLoginPage({ section }: { section: AdminSectionId }) {
  const returnPath = buildAdminReturnPath(section);
  const sectionLabel = SECTION_LABELS[section];

  return (
    <div className="min-h-screen bg-[#f4efe6] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.14),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(31,77,63,0.12),_transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e34] hover:underline"
          >
            ← Retour boutique
          </Link>

          <div className="inline-flex items-center gap-3 rounded-full border border-[#d9c5aa] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            <span className="h-2 w-2 rounded-full bg-[#1f4d3f]" />
            Administration
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Connexion dashboard
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Connecte-toi directement depuis <strong>/admin</strong>. Apres authentification, tu
              restes sur le dashboard
              {section !== "overview" ? ` (${sectionLabel})` : ""}.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 text-sm text-slate-600">
            Compte avec role <strong>platform_admin</strong> requis pour les actions API (commandes,
            CRUD catalogue). Les comptes <strong>customer</strong> peuvent ouvrir le dashboard mais
            certaines sections renverront 403.
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <Suspense
            fallback={
              <div className="h-[34rem] animate-pulse rounded-[2rem] border border-[#eadfce] bg-white/90" />
            }
          >
            <AuthForm redirectPath={returnPath} embedded registerHref="/register" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
