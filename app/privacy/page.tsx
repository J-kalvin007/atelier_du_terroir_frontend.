import { StorefrontPage } from "@/components/layout/StorefrontPage";

export default function PrivacyPage() {
  return (
    <StorefrontPage>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-[#1f241c]">Politique de confidentialite</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[#5c6a59]">
          <p>
            L&apos;Atelier du Terroir collecte les donnees necessaires au traitement des commandes, a la gestion du
            compte client et au support.
          </p>
          <p>
            Les informations de paiement et de wallet sont traitees via les services securises du backend e-commerce.
          </p>
          <p>Pour toute demande relative a vos donnees, contactez agrobusiness@dealandconsulting.com.</p>
        </div>
      </div>
    </StorefrontPage>
  );
}
