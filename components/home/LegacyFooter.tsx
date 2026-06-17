import Image from "next/image";
import Link from "next/link";
import { logoImage } from "@/assets/images";

const pageLinks = [
  { label: "Boutique", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "A propos", href: "/about" },
];

const solutionLinks = [
  { label: "Produits locaux", href: "/products?filter=local" },
  { label: "Produits transformes", href: "/products?filter=processed" },
  { label: "Export", href: "/products?filter=export" },
  { label: "Agrobusiness", href: "/about" },
];

const phoneNumbers = ["+228 72318393", "+228 92226399", "+228 97014471"];

export function LegacyFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#183a1f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(239,130,25,0.16),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-5">
        <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[#ef8219] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:grid-cols-4 md:px-6">
          {["Paiement securise", "Livraison rapide", "Produits certifies", "Support 7j/7"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white"
              >
                <span>•</span>
                {item}
              </div>
            )
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="relative mx-auto mt-6 overflow-hidden rounded-[1.35rem] bg-[#4fad28] px-5 py-4 shadow-[0_20px_52px_rgba(0,0,0,0.16)] md:px-6">
          <div className="relative grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18">✉</div>
              <div>
                <p className="text-xs font-semibold text-white/75">Soyez au courant</p>
                <h3 className="text-lg font-black leading-tight text-white">Restez informe</h3>
              </div>
            </div>
            <div className="flex gap-2 rounded-full bg-white p-1 shadow-inner">
              <input
                type="email"
                placeholder="Votre email"
                className="min-w-0 flex-1 rounded-full px-4 text-sm font-medium text-[#183a1f] outline-none placeholder:text-[#183a1f]/45"
              />
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#ef8219] px-4 text-xs font-black text-white hover:bg-[#d96f13]"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[1.25fr_0.65fr_0.8fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
                <Image
                  src={logoImage}
                  alt="Logo L'Atelier du Terroir"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-black leading-tight">L&apos;Atelier du Terroir</h2>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#ef8219]">
                  Deal & Consulting
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/68">
              Des produits du terroir d&apos;exception, selectionnes avec soin pour reveler le meilleur de la gastronomie agricole locale et export.
            </p>
          </div>

          <FooterColumn title="Navigation" links={pageLinks} />
          <FooterColumn title="Solutions" links={solutionLinks} />

          <div>
            <FooterTitle>Contact</FooterTitle>
            <div className="mt-4 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Email</p>
                <p className="mt-1">agrobusiness@dealandconsulting.com</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Telephone
                </p>
                <div className="mt-1 space-y-1">
                  {phoneNumbers.map((phone) => (
                    <p key={phone}>{phone}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Adresse</p>
                <p className="mt-1">Rue 120 Agoe Minamadou, Lome</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row">
          <p>&copy; 2026 Deal & Consulting. Tous droits reserves.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="transition hover:text-white/75">
              Confidentialite
            </Link>
            <span>·</span>
            <Link href="/terms" className="transition hover:text-white/75">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-black text-white">{children}</p>
      <div className="mt-2 h-0.5 w-9 rounded-full bg-[#ef8219]" />
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <FooterTitle>{title}</FooterTitle>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
            >
              {link.label}
              <span className="opacity-0 transition group-hover:opacity-100">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
