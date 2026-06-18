"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  User,
  Wallet,
  X,
} from "lucide-react";
import { logoImage } from "@/assets/images";
import { logout, readSession, hasAdminAccess } from "@/lib/auth";
import { useAuthSession } from "@/components/auth/useAuthSession";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/products" },
  { label: "Promotions", href: "/promotions" },
  { label: "A propos", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const PROFILE_LINKS = [
  { label: "Mon Dashboard", href: "/dashboard", icon: User },
  { label: "Mes Commandes", href: "/orders", icon: Package },
  { label: "Mon Portefeuille", href: "/wallet", icon: Wallet },
  { label: "Ma Fidelite", href: "/loyalty", icon: Star },
  { label: "Parametres", href: "/settings", icon: Settings },
] as const;

const POPULAR_SEARCHES = ["Huile d'olive", "Chocolat", "Epices", "The vert"];

export function LegacyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const cartCount = useCartStore((state) => state.getItemCount());
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = Boolean(session?.token);
  const isAdmin = hasAdminAccess(session);
  const displayName =
    session?.user.firstName ||
    session?.user.name ||
    session?.user.username ||
    session?.user.email?.split("@")[0] ||
    "Mon compte";
  const isHomePage = pathname === "/";
  const isAtTop = !isScrolled;
  const heroStyle = isHomePage && isAtTop;

  async function handleLogout() {
    const currentSession = readSession();
    await logout(currentSession);
    router.replace("/");
  }

  function submitSearch(term: string) {
    const query = term.trim();
    if (!query) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const headerClass = isAtTop
    ? "bg-transparent"
    : "border-b border-[#e8d9c5] bg-white/88 shadow-[0_14px_34px_rgba(34,27,18,0.08)] backdrop-blur-xl";

  return (
    <>
      <CartDrawer />
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={cx(
              "flex items-center gap-3 rounded-full px-3 py-2 transition-colors",
              heroStyle && "bg-white/14 backdrop-blur-md"
            )}
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
              <p className={cx("text-lg font-semibold", heroStyle ? "text-white" : "text-[#184126]")}>
                Atelier du Terroir
              </p>
              <p
                className={cx(
                  "text-[10px] font-semibold uppercase tracking-[0.22em]",
                  heroStyle ? "text-white/75" : "text-[#5c6a59]"
                )}
              >
                Deal and Consulting
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#ef8219] text-white shadow-sm"
                      : heroStyle
                        ? "text-white/86 hover:bg-white/12 hover:text-white"
                        : isAtTop
                          ? "text-[#52604e] hover:bg-[#f5ecdf]/60 hover:text-[#8b5e34]"
                          : "text-[#52604e] hover:bg-[#f5ecdf] hover:text-[#8b5e34]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className={cx(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  heroStyle
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : isAtTop
                      ? "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60"
                      : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
                )}
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchOpen ? (
                <div className="absolute right-0 top-12 w-80 rounded-2xl border border-[#eadcca] bg-white p-3 shadow-xl">
                  <div className="flex items-center gap-2 rounded-xl bg-[#f7f3eb] px-3 py-2">
                    <Search className="h-4 w-4 text-[#8b5e34]" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitSearch(searchQuery);
                      }}
                      placeholder="Rechercher un produit..."
                      className="flex-1 bg-transparent text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => submitSearch(term)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#52604e] hover:bg-[#f5ecdf]"
                      >
                        <Search className="h-3.5 w-3.5" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              href="/wishlist"
              className={cx(
                "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : isAtTop
                    ? "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60"
                    : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
              )}
              aria-label="Ma liste de souhaits"
            >
              <Heart className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => toggleDrawer(true)}
              className={cx(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : isAtTop
                    ? "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60"
                    : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
              )}
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="h-4 w-4" />
              {hasHydrated && cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef8219] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {isAuthenticated ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className={cx(
                    "flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors",
                    heroStyle
                      ? "border border-white/25 bg-white/10 backdrop-blur-sm"
                      : isAtTop
                        ? "border border-[#e0cfb9]/70 bg-transparent"
                        : "border border-[#d8c4ab] bg-white"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f4d3f] text-sm font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={cx(
                      "max-w-[120px] truncate text-sm font-semibold",
                      heroStyle ? "text-white" : "text-[#1f4d3f]"
                    )}
                  >
                    {displayName}
                  </span>
                  <ChevronDown
                    className={cx(
                      "h-4 w-4",
                      heroStyle ? "text-white/80" : "text-[#8b5e34]",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-xl">
                    <div className="border-b border-[#eadcca] bg-[#f7f3eb] p-4">
                      <p className="text-sm font-semibold text-[#1f241c]">{displayName}</p>
                      <p className="text-xs text-[#5c6a59]">{session?.user.email}</p>
                    </div>
                    <div className="p-2">
                      {PROFILE_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#52604e] hover:bg-[#f5ecdf]"
                          onClick={() => setProfileOpen(false)}
                        >
                          <link.icon className="h-4 w-4 text-[#8b5e34]" />
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#52604e] hover:bg-[#f5ecdf]"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-[#8b5e34]" />
                          Dashboard Admin
                        </Link>
                      ) : null}
                    </div>
                    <div className="border-t border-[#eadcca] p-2">
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Se deconnecter
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full bg-[#ef8219] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86d14] sm:inline-flex"
              >
                Connexion
              </Link>
            )}

            <button
              type="button"
              className={cx(
                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : isAtTop
                    ? "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60"
                    : "border border-[#e0cfb9] bg-white text-[#5c6a59] hover:bg-[#f7f0e4]"
              )}
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {!isHomePage ? <div className="h-[88px]" aria-hidden /> : null}

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
              <p className="text-lg font-semibold text-[#1f241c]">Menu</p>
              <button
                type="button"
                className="rounded-full border border-[#e3d5c2] px-3 py-1 text-sm text-[#5c6a59]"
                onClick={() => setMobileOpen(false)}
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(
                      "block rounded-2xl px-4 py-3 text-sm font-medium",
                      isActive ? "bg-[#1f4d3f] text-white" : "bg-white text-[#4f5e4a] hover:bg-[#f3eadf]"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/wishlist"
                className="block rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#4f5e4a] hover:bg-[#f3eadf]"
                onClick={() => setMobileOpen(false)}
              >
                Ma liste de souhaits
              </Link>
            </div>

            <div className="mt-6 space-y-2 border-t border-[#eadcca] pt-5">
              {isAuthenticated ? (
                <>
                  {PROFILE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-2xl border border-[#d8c4ab] px-4 py-3 text-sm font-semibold text-[#1f4d3f]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="block rounded-2xl border border-[#d8c4ab] px-4 py-3 text-sm font-semibold text-[#1f4d3f]"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  ) : null}
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
                    Creer un compte
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
