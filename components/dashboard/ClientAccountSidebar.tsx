"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Home, ShoppingBag } from "lucide-react";
import { logoImage } from "@/assets/images";
import { CLIENT_NAV_LINKS } from "@/components/dashboard/client-nav-links";
import { useAuthSession } from "@/components/auth/useAuthSession";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isLinkActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function ClientAccountSidebar() {
  const pathname = usePathname();
  const session = useAuthSession();
  const displayName =
    session?.user.firstName ||
    session?.user.name ||
    session?.user.email?.split("@")[0] ||
    "Client";

  return (
    <aside className="flex w-full flex-col border-b border-[#e8d9c5] bg-[#f7f3eb] px-5 py-6 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="overflow-hidden rounded-xl bg-white p-0.5 shadow-sm">
          <Image src={logoImage} alt="Logo" width={40} height={40} className="h-10 w-10 object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-[#184126]">Atelier du Terroir</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
            Espace client
          </p>
        </div>
      </Link>

      <div className="mt-5 rounded-xl border border-[#eadcca] bg-white p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ef8219] text-xs font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#8b5e34]">Bonjour,</p>
            <p className="truncate text-sm font-semibold capitalize text-[#184126]">{displayName}</p>
          </div>
        </div>
      </div>

      <nav
        aria-label="Navigation compte"
        className="mt-5 rounded-2xl border border-[#eadcca] bg-white p-2 shadow-sm"
      >
        <ul className="space-y-1">
          {CLIENT_NAV_LINKS.map((link) => {
            const isActive = isLinkActive(pathname, link.href);
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cx(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-[#fff5eb] text-[#184126] ring-1 ring-[#ef8219]/35"
                      : "text-[#52604e] hover:bg-[#f7f3eb] hover:text-[#8b5e34]"
                  )}
                >
                  <Icon className={cx("h-4 w-4 shrink-0", isActive ? "text-[#ef8219]" : "text-[#8b5e34]")} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-[#52604e] transition hover:bg-[#f5ecdf] hover:text-[#8b5e34]"
        >
          <Home className="h-3.5 w-3.5" />
          Retour accueil
        </Link>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-[#52604e] transition hover:bg-[#f5ecdf] hover:text-[#8b5e34]"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Voir la boutique
        </Link>
      </div>

      <div className="mt-auto hidden pt-5 lg:block">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef8219] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#d97316]"
        >
          Continuer mes achats
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
