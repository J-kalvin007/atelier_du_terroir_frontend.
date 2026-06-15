const features = [
  {
    title: "Authentification partagee",
    description:
      "Une seule page de connexion et une seule page d'inscription pour les comptes client et admin.",
  },
  {
    title: "Redirection par role",
    description:
      "Apres connexion, l'API renvoie le role puis le frontend envoie automatiquement vers `/admin` ou `/client`.",
  },
  {
    title: "Catalogue connecte",
    description:
      "Produits, categories, variantes et promotions s'affichent a partir des endpoints reels au lieu de cartes bidons.",
  },
  {
    title: "Gestion admin",
    description:
      "L'espace admin sert a creer les produits et a suivre les contenus qui remontent ensuite cote client.",
  },
  {
    title: "Parcours e-commerce",
    description:
      "Le projet suit le TDR: consultation, panier, commande, livraison, promotions et fidelisation.",
  },
  {
    title: "Structure plus simple",
    description:
      "On garde des composants clairs: hero, categories, produits tendances et section des avantages.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#fbf7ee] px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Pourquoi cette nouvelle home
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1d241d] md:text-4xl">
            Une base plus proche de l&apos;ancien projet, mais enfin connectee au vrai backend
          </h2>
          <p className="mt-4 text-base leading-7 text-[#5d6a59]">
            L&apos;objectif est que tu reconnaisses la vitrine precedente tout en gardant une
            structure plus simple a comprendre et plus facile a faire evoluer.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="relative overflow-hidden rounded-[1.9rem] border border-[#e6d8c5] bg-white p-6 shadow-[0_18px_48px_rgba(66,49,23,0.06)]"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#f2e3d2] blur-2xl" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f4d3f] text-sm font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#1e261d]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#556352]">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
