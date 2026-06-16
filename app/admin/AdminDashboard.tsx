"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  buildAdminReturnPath,
  getSessionRoleLabel,
  hasAdminAccess,
  logout,
  refreshSessionFromProfile,
} from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import AdminShell from "./components/AdminShell";
import AdminLoginPage from "./components/AdminLoginPage";
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

function AdminRoleBanner({
  session,
  onSwitchAccount,
}: {
  session: AuthSession;
  onSwitchAccount: () => void;
}) {
  const roleLabel = getSessionRoleLabel(session);

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
      <p className="font-semibold">Compte connecte sans droits admin detectes</p>
      <p className="mt-2 leading-6 text-amber-900/90">
        Role actuel : <strong>{roleLabel}</strong>. Tu peux parcourir le dashboard, mais les
        creations peuvent etre refusees par l&apos;API sans le role{" "}
        <strong>platform_admin</strong>.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSwitchAccount}
          className="inline-flex rounded-xl bg-[#1f4d3f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#17392f]"
        >
          Changer de compte
        </button>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-[#8b5e34] px-4 py-2 text-xs font-semibold text-[#8b5e34] transition hover:bg-[#f8ecdf]"
        >
          Retour boutique
        </Link>
      </div>
    </div>
  );
}

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

  const adminAccess = hasAdminAccess(session);
  const adminReturnPath = buildAdminReturnPath(section);

  async function handleSwitchAccount() {
    if (session?.token) {
      await logout(session);
    }

    router.replace(adminReturnPath);
  }

  if (!session?.token) {
    return <AdminLoginPage section={section} />;
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
        {!adminAccess ? (
          <AdminRoleBanner session={session} onSwitchAccount={() => void handleSwitchAccount()} />
        ) : (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
            <p className="font-semibold">Session administrateur active</p>
            <p className="mt-2 leading-6 text-emerald-900/90">
              Role : <strong>{getSessionRoleLabel(session)}</strong>. Tu peux gerer toutes les
              sections du dashboard et naviguer vers la boutique client via le menu lateral.
            </p>
          </div>
        )}
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
