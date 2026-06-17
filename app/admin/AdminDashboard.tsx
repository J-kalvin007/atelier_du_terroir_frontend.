"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  buildAdminReturnPath,
  getSessionRoleLabel,
  logout,
  refreshSessionFromProfile,
} from "@/lib/auth";
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

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const refreshedTokenRef = useRef<string | null>(null);
  const [refreshingRole, setRefreshingRole] = useState(false);
  const sectionParam = searchParams.get("section");
  const initialSection: AdminSectionId = isAdminSection(sectionParam) ? sectionParam : "overview";
  const [section, setSection] = useState<AdminSectionId>(initialSection);

  useEffect(() => {
    const currentSection = searchParams.get("section");
    if (isAdminSection(currentSection)) {
      setSection(currentSection);
    } else {
      setSection("overview");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!session?.token || refreshedTokenRef.current === session.token) {
      return;
    }

    refreshedTokenRef.current = session.token;
    setRefreshingRole(true);

    void refreshSessionFromProfile(session)
      .catch(() => undefined)
      .finally(() => {
        setRefreshingRole(false);
      });
  }, [session]);

  const adminReturnPath = buildAdminReturnPath(section);

  async function handleSwitchAccount() {
    if (session?.token) {
      await logout(session);
    }

    router.replace(adminReturnPath);
  }

  if (!session?.token) {
    return null;
  }

  return (
    <AdminShell
      activeSection={section}
      onSectionChange={setSection}
      adminReturnPath={adminReturnPath}
      onLogout={() => void handleSwitchAccount()}
    >
      {refreshingRole ? (
        <div className="mb-4 rounded-xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-slate-500">
          Verification du role administrateur...
        </div>
      ) : null}
      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
        <p className="font-semibold">Session administrateur active</p>
        <p className="mt-2 leading-6 text-emerald-900/90">
          Role : <strong>{getSessionRoleLabel(session)}</strong>. Tu peux gerer toutes les sections
          du dashboard et naviguer vers la boutique client via le menu lateral.
        </p>
      </div>
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
