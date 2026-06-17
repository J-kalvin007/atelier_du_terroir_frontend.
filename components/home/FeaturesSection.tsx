"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Star,
  ShoppingBag,
  Globe,
  Headphones,
  RefreshCw,
  Apple,
  Leaf,
  Bird,
  Rabbit,
  Cherry,
  Flower2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Portefeuille Integre",
    description:
      "Rechargez votre wallet via carte bancaire ou Mobile Money. Payez instantanement vos commandes.",
    iconColor: "text-primary",
    bgIcon: <Cherry className="absolute -bottom-3 -right-3 h-16 w-16 text-rose-200/60" />,
  },
  {
    icon: Star,
    title: "Programme de Fidelite",
    description:
      "Gagnez des points a chaque achat. Montez en palier : Bronze → Argent → Or → Platine.",
    iconColor: "text-highlight",
    bgIcon: <Flower2 className="absolute -top-3 -left-3 h-14 w-14 text-emerald-200/60" />,
  },
  {
    icon: ShoppingBag,
    title: "Checkout Express",
    description:
      "Commandez en tant qu'invite ou avec votre compte. 3 etapes et c'est valide.",
    iconColor: "text-emerald-500",
    bgIcon: <Rabbit className="absolute -bottom-2 -right-2 h-14 w-14 text-highlight/20" />,
  },
  {
    icon: Globe,
    title: "Livraison Mondiale",
    description:
      "Presents dans plus de 120 pays. Suivi en temps reel avec DHL, FedEx, Colissimo.",
    iconColor: "text-blue-500",
    bgIcon: <Apple className="absolute -top-3 -right-3 h-14 w-14 text-pink-200/60" />,
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description:
      "Une equipe dediee pour repondre a vos questions. Chat, email et telephone.",
    iconColor: "text-purple-500",
    bgIcon: <Leaf className="absolute -bottom-3 -left-3 h-14 w-14 text-green-200/60" />,
  },
  {
    icon: RefreshCw,
    title: "Retours Simplifies",
    description:
      "Pas satisfait ? Retour gratuit sous 30 jours. Remboursement sur votre wallet.",
    iconColor: "text-rose-500",
    bgIcon: <Bird className="absolute -top-2 -right-2 h-14 w-14 text-sky-200/60" />,
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7e8] py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Apple className="absolute left-5 top-20 h-10 w-10 rotate-12 text-rose-200/50" />
        <Leaf className="absolute right-10 bottom-32 h-12 w-12 -rotate-6 text-emerald-200/50" />
        <Rabbit className="absolute bottom-10 left-1/3 h-14 w-14 text-highlight/15" />
        <Flower2 className="absolute right-1/4 top-40 h-8 w-8 text-purple-200/50" />
        <Bird className="absolute bottom-1/3 left-5 h-7 w-7 text-sky-200/50" />
        <Cherry className="absolute right-10 top-1/3 h-9 w-9 text-pink-200/50" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Pourquoi Atelier du Terroir
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Une experience <span className="text-primary">d&apos;exception</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Plus qu&apos;une boutique en ligne, un ecosysteme complet pour les amoureux du
            terroir.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {feature.bgIcon}

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-highlight/10 ${feature.iconColor}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
              </div>

              <p className="relative z-10 mt-4 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>

              <div className="relative z-10 mt-4 h-0.5 w-12 rounded-full bg-highlight/25 transition-all duration-300 group-hover:w-16" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
