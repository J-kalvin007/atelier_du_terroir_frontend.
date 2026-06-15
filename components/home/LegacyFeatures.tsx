const features = [
  {
    title: "Portefeuille integre",
    description: "Rechargez votre wallet via carte bancaire ou Mobile Money puis payez vos commandes.",
    icon: "💳",
  },
  {
    title: "Programme de fidelite",
    description: "Montez en palier avec les achats et beneficiez de remises et avantages.",
    icon: "⭐",
  },
  {
    title: "Checkout express",
    description: "Commandez en quelques etapes avec une experience d'achat fluide.",
    icon: "🛍️",
  },
  {
    title: "Livraison mondiale",
    description: "Suivi logistique et distribution locale ou internationale selon le besoin.",
    icon: "🌍",
  },
  {
    title: "Support 24/7",
    description: "Une equipe dediee repond a vos questions sur produits, commandes et paiements.",
    icon: "🎧",
  },
  {
    title: "Retours simplifies",
    description: "Une logique plus claire pour les remboursements et le service apres-vente.",
    icon: "🔄",
  },
];

export function LegacyFeatures() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-5 top-20 text-4xl text-rose-200/50">🍎</div>
        <div className="absolute right-10 bottom-32 text-5xl text-emerald-200/50">🌿</div>
        <div className="absolute left-1/3 bottom-10 text-6xl text-[#ef8219]/15">🐇</div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#4fad28]">
            Pourquoi Atelier du Terroir
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Une experience d&apos;exception
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Plus qu&apos;une boutique en ligne, la plateforme vise un ecosysteme complet autour du terroir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -right-3 -top-3 text-5xl opacity-15">{feature.icon}</div>
              <div className="relative z-10 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef8219]/10 text-lg">
                  {feature.icon}
                </div>
              </div>
              <p className="relative z-10 mt-4 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
              <div className="relative z-10 mt-4 h-0.5 w-12 rounded-full bg-[#ef8219]/25 transition-all duration-300 group-hover:w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
