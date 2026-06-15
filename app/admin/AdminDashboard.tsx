"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { clearSession } from "@/lib/auth";
import AdminShell from "./components/AdminShell";
import OverviewSection from "./components/OverviewSection";
import ProductsSection from "./components/ProductsSection";
import CategoriesSection from "./components/CategoriesSection";
import OrdersSection from "./components/OrdersSection";
import ClientsSection from "./components/ClientsSection";
import PromotionsSection from "./components/PromotionsSection";
import SettingsSection from "./components/SettingsSection";
import AnalyticsSection from "./components/AnalyticsSection";
import AuditSection from "./components/AuditSection";
import BannersSection from "./components/BannersSection";
import LoyaltySection from "./components/LoyaltySection";
import WalletSection from "./components/WalletSection";

export type AdminSectionId =
  | "analytics"
  | "audit"
  | "banners"
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "clients"
  | "promotions"
  | "loyalty"
  | "wallet"
  | "settings";

const SECTIONS: AdminSectionId[] = [
  "analytics",
  "audit",
  "banners",
  "overview",
  "products",
  "categories",
  "orders",
  "clients",
  "promotions",
  "loyalty",
  "wallet",
  "settings",
];

function AccessDeniedSection({
  roleLabel,
  isAuthenticated,
}: {
  roleLabel: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Acces admin requis</h1>
        <p className="text-sm text-slate-500">
          Cette page suit maintenant la logique de ton ancien projet: l&apos;entree `/admin`
          reste visible, puis la connexion admin se fait depuis ici.
        </p>
      </div>

      <div className="rounded-3xl border border-[#ead8c3] bg-white/90 p-8 shadow-sm">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-[#e7d8c5] bg-[#fbf5ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
            Dashboard administrateur
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Connecte-toi avec un compte ayant le role admin backend.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Le backend doit renvoyer un role admin comme `platform_admin`, ou un attribut
            equivalent comme `is_staff` ou `admin_role`.
          </p>

          <div className="rounded-2xl border border-[#f0e3d5] bg-[#fffaf5] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
              Role detecte actuellement
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">{roleLabel}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                className="rounded-2xl bg-[#8b5e34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#744b27]"
                onClick={() => {
                  clearSession();
                  router.replace("/admin");
                }}
              >
                Deconnexion
              </button>
            ) : (
              <Link
                href="/login?redirect=/admin"
                className="rounded-2xl bg-[#1f4d3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17392f]"
              >
                Se connecter en admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const sectionParam = searchParams.get("section");
  const initialSection: AdminSectionId = isAdminSection(sectionParam) ? sectionParam : "overview";
  const [section, setSection] = useState<AdminSectionId>(initialSection);

  // Sync state section when search query changes
  useEffect(() => {
    const currentSection = searchParams.get("section");
    if (isAdminSection(currentSection)) {
      setSection(currentSection);
    } else {
      setSection("overview");
    }
  }, [searchParams]);

  // We bypass the role block to always display the section pages as requested
  return (
    <AdminShell activeSection={section} onSectionChange={setSection}>
      {renderSection(section)}
    </AdminShell>
  );
}

function isAdminSection(value: string | null): value is AdminSectionId {
  return value !== null && SECTIONS.includes(value as AdminSectionId);
}

function renderSection(section: AdminSectionId) {
  switch (section) {
    case "analytics":
      return <AnalyticsSection />;
    case "audit":
      return <AuditSection />;
    case "banners":
      return <BannersSection />;
    case "products":
      return <ProductsSection />;
    case "categories":
      return <CategoriesSection />;
    case "orders":
      return <OrdersSection />;
    case "clients":
      return <ClientsSection />;
    case "promotions":
      return <PromotionsSection />;
    case "loyalty":
      return <LoyaltySection />;
    case "wallet":
      return <WalletSection />;
    case "settings":
      return <SettingsSection />;
    case "overview":
    default:
      return <OverviewSection />;
  }
}
