"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { logoImage } from "@/assets/images";
import { logout, readSession } from "@/lib/auth";
import { useAuthSession } from "@/components/auth/useAuthSession";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/products" },
  { label: "Promotions", href: "/products" },
  { label: "A propos", href: "/" },
  { label: "Contact", href: "/" },
];

export function LegacyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = Boolean(session);
  const isAdmin = session?.role === "admin";
  const displayName =
    session?.user.firstName ||
    session?.user.name ||
    session?.user.username ||
    session?.user.email?.split("@")[0] ||
    "Mon compte";

  async function handleLogout() {
    const currentSession = readSession();
    await logout(currentSession);
    router.replace("/");
  }

  const headerClass =
    pathname === "/" && !isScrolled
      ? "bg-transparent"
      : "border-b border-[#e8d9c5] bg-white/88 shadow-[0_14px_34px_rgba(34,27,18,0.08)] backdrop-blur-xl";

  return (
    <>
      <CartDrawer />
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full bg-white/14 px-3 py-2 backdrop-blur-md"
          >
            <div className="overflow-hidden rounded-full bg-white shadow-lg">
              <Image
                src={logoImage}
                alt="Logo L'Atelier du Terroir"
                width={52}
                height={52}
                className="h-12 w-12 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className={cx("text-lg font-semibold", pathname === "/" && !isScrolled ? "text-white" : "text-[#184126]")}>
                Atelier du Terroir
              </p>
              <p
                className={cx(
                  "text-[10px] font-semibold uppercase tracking-[0.22em]",
                  pathname === "/" && !isScrolled ? "text-white/75" : "text-[#5c6a59]"
                )}
              >
                Deal and Consulting
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-white/12 p-2 backdrop-blur-md lg:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm font-medium",
                    isActive
                      ? "bg-white text-[#1f4d3f] shadow-sm"
                      : pathname === "/" && !isScrolled
                        ? "text-white/86 hover:bg-white/12 hover:text-white"
                        : "text-[#52604e] hover:bg-[#f5ecdf] hover:text-[#8b5e34]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDrawer(true)}
              className={cx(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
                pathname === "/" && !isScrolled
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
              )}
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef8219] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/"}
                  className={cx(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    pathname === "/" && !isScrolled
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-[#d8c4ab] text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
                  )}
                >
                  {isAdmin ? "Dashboard Admin" : displayName}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-full bg-[#ef8219] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86d14]"
                >
                  Deconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cx(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    pathname === "/" && !isScrolled
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-[#d8c4ab] text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
                  )}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#ef8219] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86d14]"
                >
                  Inscription
                </Link>
              </>
            )}

            <button
              type="button"
              className={cx(
                "inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
                pathname === "/" && !isScrolled
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
              )}
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? "X" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div className="h-[88px]" aria-hidden />

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[290px] overflow-y-auto bg-[#fffaf2] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[#1f241c]">Navigation</p>
              <button
                type="button"
                className="rounded-full border border-[#e3d5c2] px-3 py-1 text-sm text-[#5c6a59]"
                onClick={() => setMobileOpen(false)}
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

                return (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={cx(
                      "block rounded-2xl px-4 py-3 text-sm font-medium",
                      isActive
                        ? "bg-[#1f4d3f] text-white"
                        : "bg-white text-[#4f5e4a] hover:bg-[#f3eadf]"
                    )}
                    >
                      {link.label}
                    </Link>
                );
              })}
            </div>

            <div className="mt-6 space-y-2 border-t border-[#eadcca] pt-5">
              {isAuthenticated ? (
                <>
                  <Link
                    href={isAdmin ? "/admin" : "/"}
                    className="block rounded-2xl border border-[#d8c4ab] px-4 py-3 text-sm font-semibold text-[#1f4d3f]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {isAdmin ? "Ouvrir le dashboard admin" : displayName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="w-full rounded-2xl bg-[#ef8219] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-[#d8c4ab] px-4 py-3 text-center text-sm font-semibold text-[#1f4d3f]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="block rounded-2xl bg-[#ef8219] px-4 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
