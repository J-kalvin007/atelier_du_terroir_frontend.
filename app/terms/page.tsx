import { StorefrontPage } from "@/components/layout/StorefrontPage";

export default function TermsPage() {
  return (
    <StorefrontPage>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-[#1f241c]">Conditions generales</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[#5c6a59]">
          <p>
            L&apos;utilisation de la boutique implique l&apos;acceptation des conditions de vente, des delais de
            livraison et des modalites de paiement affichees lors du checkout.
          </p>
          <p>
            Les promotions, codes promo et ventes flash sont soumis aux conditions indiquees sur chaque offre.
          </p>
          <p>Pour toute question commerciale, contactez notre equipe via la page Contact.</p>
        </div>
      </div>
    </StorefrontPage>
  );
}
