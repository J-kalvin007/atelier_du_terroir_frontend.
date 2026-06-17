import { LayoutDashboard, Package, Settings, Star, Wallet } from "lucide-react";

export const CLIENT_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Mes commandes", icon: Package, desc: "Suivi et historique" },
  { href: "/wallet", label: "Mon portefeuille", icon: Wallet, desc: "Solde et recharges" },
  { href: "/loyalty", label: "Ma fidelite", icon: Star, desc: "Points et paliers" },
  { href: "/settings", label: "Parametres", icon: Settings, desc: "Profil et compte" },
] as const;
