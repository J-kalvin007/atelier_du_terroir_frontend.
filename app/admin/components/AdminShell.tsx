"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { buildAdminReturnPath, hasAdminAccess, logout } from "@/lib/auth";
import type { AdminSectionId } from "../AdminDashboard";

const CLIENT_LINKS = [
  { label: "Boutique accueil", href: "/" },
  { label: "Catalogue produits", href: "/products" },
  { label: "Mon compte client", href: "/account" },
  { label: "Panier / checkout", href: "/checkout" },
];

const NAV_ITEMS: Array<{ id: AdminSectionId; label: string; icon: string; href: string }> = [
  { id: "overview", label: "Dashboard", icon: "D", href: "/admin" },
  { id: "products", label: "Produits", icon: "P", href: "/admin?section=products" },
  { id: "categories", label: "Categories", icon: "C", href: "/admin?section=categories" },
  { id: "orders", label: "Commandes", icon: "O", href: "/admin?section=orders" },
  { id: "clients", label: "Clients", icon: "U", href: "/admin?section=clients" },
  { id: "promotions", label: "Promotions", icon: "%", href: "/admin?section=promotions" },
  { id: "settings", label: "Parametres", icon: "S", href: "/admin?section=settings" },
];

export default function AdminShell({
  activeSection,
  onSectionChange,
  adminReturnPath,
  onLogout,
  children,
}: {
  activeSection: AdminSectionId;
  onSectionChange: (section: AdminSectionId) => void;
  adminReturnPath?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useAuthSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const returnPath = adminReturnPath ?? buildAdminReturnPath(activeSection);

  const displayName =
    session?.user.firstName ||
    session?.user.name ||
    session?.user.username ||
    session?.user.email?.split("@")[0] ||
    "Admin";

  function openSection(item: (typeof NAV_ITEMS)[number]) {
    onSectionChange(item.id);
    setMobileOpen(false);
    router.replace(item.href, { scroll: false });
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    if (!session?.token) {
      router.replace(returnPath);
      return;
    }

    void logout(session).then(() => {
      router.replace(returnPath);
    });
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f4efe6] text-slate-900">
      <aside
        className={cx(
          "hidden flex-col border-r border-[#eadfce] bg-white shadow-[18px_0_40px_-34px_rgba(139,94,52,0.22)] transition-all duration-300 lg:flex",
          collapsed ? "w-[78px]" : "w-[270px]"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#eadfce] px-4">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5e34] text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Atelier Admin</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Administration
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5e34] text-sm font-bold text-white">
              A
            </div>
          )}

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#f7f1e8] hover:text-[#8b5e34]"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#f8ecdf] text-[#8b5e34] shadow-sm"
                    : "text-slate-600 hover:bg-[#fcf7f1] hover:text-slate-900"
                )}
                type="button"
                onClick={() => openSection(item)}
              >
                <span
                  className={cx(
                    "flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                    isActive ? "bg-[#8b5e34] text-white" : "bg-[#f2e8db] text-[#8b5e34]"
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>

        {!collapsed ? (
          <div className="border-t border-[#eadfce] px-2 py-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Espace client
            </p>
            <div className="space-y-1">
              {CLIENT_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#fcf7f1] hover:text-[#8b5e34]"
                >
                  <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md bg-[#eef6f1] text-[10px] font-bold text-[#1f4d3f]">
                    B
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!collapsed ? (
          <div className="border-t border-[#eadfce] p-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#fcfaf7] p-3 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f4d3f] text-xs font-bold text-white">
                {displayName.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-900">{displayName}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {hasAdminAccess(session) ? "Administrateur" : "Compte connecte"}
                </p>
              </div>
              <button
                className="rounded-lg p-2 text-slate-400 transition hover:bg-[#fff4ea] hover:text-[#8b5e34]"
                type="button"
                onClick={handleLogout}
                title="Se deconnecter"
              >
                Out
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/45"
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-[#eadfce] bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[#eadfce] px-4">
              <span className="text-sm font-bold text-slate-900">Atelier Admin</span>
              <button
                className="rounded-lg p-2 text-slate-500 transition hover:bg-[#f7f1e8]"
                type="button"
                onClick={() => setMobileOpen(false)}
              >
                X
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    activeSection === item.id
                      ? "bg-[#f8ecdf] text-[#8b5e34]"
                      : "text-slate-600 hover:bg-[#fcf7f1]"
                  )}
                  type="button"
                  onClick={() => openSection(item)}
                >
                  <span className="flex h-[20px] w-[20px] items-center justify-center rounded-md bg-[#f2e8db] text-[11px] font-bold text-[#8b5e34]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="border-t border-[#eadfce] px-2 py-3">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Espace client
              </p>
              <div className="space-y-1">
                {CLIENT_LINKS.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#fcf7f1] hover:text-[#8b5e34]"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eadfce] bg-white/85 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 transition hover:bg-[#f7f1e8] lg:hidden"
              type="button"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <div className="relative hidden sm:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Rechercher
              </span>
              <input
                className="h-9 w-64 rounded-lg border border-[#e6d9c6] bg-[#fffdfa] pl-24 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#8b5e34]"
                placeholder="Produits, clients..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6d9c6] bg-white text-slate-500 transition hover:bg-[#f8ecdf]"
              type="button"
            >
              N
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1f4d3f] text-[9px] font-bold text-white">
                3
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
