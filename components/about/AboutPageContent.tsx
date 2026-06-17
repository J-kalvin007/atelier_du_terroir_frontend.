"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Heart,
  Leaf,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
  Users,
} from "lucide-react";
import heroImage from "@/assets/images/img_06.png";
import timelineImageOne from "@/assets/images/arachide.jpg";
import timelineImageTwo from "@/assets/images/Poivrons.png";
import timelineImageThree from "@/assets/images/LOGO.png";
import detailImageOne from "@/assets/images/fruit.jpg";
import detailImageThree from "@/assets/images/legume.jpg";

const PILLARS = [
  {
    icon: Leaf,
    title: "Maitrise des cultures",
    desc: "De la preparation des sols a la recolte, chaque etape est suivie avec precision pour garantir des rendements fiables et une qualite constante.",
  },
  {
    icon: ShieldCheck,
    title: "Securite alimentaire",
    desc: "Nos produits sont cultives, prepares et distribues dans le respect des exigences sanitaires et des standards professionnels.",
  },
  {
    icon: Heart,
    title: "Valeur nutritive",
    desc: "Nous privilegions des cultures riches en nutriments essentiels afin de proposer des produits sains, utiles et regulierement controles.",
  },
  {
    icon: Truck,
    title: "Conservation optimale",
    desc: "Nos methodes de stockage et de transport preservent la fraicheur, la qualite et la tenue des produits jusqu'a la livraison.",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Production et partenariats",
    desc: "La Ferme Solime assure une production directe et travaille avec des producteurs locaux fiables pour garantir un approvisionnement maitrise.",
    image: timelineImageOne,
  },
  {
    step: "02",
    title: "Suivi qualite et preparation",
    desc: "Chaque lot est trie, prepare et controle selon les besoins des marches locaux, professionnels et internationaux.",
    image: timelineImageTwo,
  },
  {
    step: "03",
    title: "Distribution et livraison",
    desc: "Les produits sont achemines avec une logistique adaptee afin de conserver leur qualite jusqu'au client final.",
    image: timelineImageThree,
  },
] as const;

const DISCOUNT_TIERS = [
  { title: "Silver", range: "300 000 - 500 000 FCFA", discount: "2%" },
  { title: "Gold", range: "500 000 - 1 000 000 FCFA", discount: "5%" },
  { title: "Platinum", range: "1 000 000 - 2 000 000 FCFA", discount: "8%" },
  { title: "Diamond", range: "2 000 000 - 3 500 000 FCFA", discount: "10%" },
  { title: "Elite / VIP", range: "+ 3 500 000 FCFA", discount: "12%" },
] as const;

const TESTIMONIALS = [
  {
    role: "Distributeur",
    icon: Users,
    text: "Collaborer avec Solime nous assure des produits fiables et de qualite. Leur professionnalisme facilite grandement notre distribution.",
  },
  {
    role: "Etablissement hotelier",
    icon: Globe,
    text: "Solime nous garantit des produits frais tout en soutenant les producteurs locaux. Une vraie confiance a chaque commande.",
  },
  {
    role: "Producteur agricole",
    icon: Leaf,
    text: "Travailler avec Solime m'a permis de valoriser mes cultures et d'avoir un marche plus stable avec un vrai accompagnement.",
  },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-3xl font-bold leading-tight text-slate-900 md:text-4xl ${className}`}
    >
      {children}
    </h2>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function AboutPageContent() {
  return (
    <div className="page-transition overflow-x-hidden bg-[#fbf7e8] pt-24 text-slate-800">
      <section className="relative overflow-hidden bg-[#fbf7e8] pb-12 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(239,130,25,0.18),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(84,121,71,0.18),transparent_30%)]" />
        <div className="absolute bottom-0 left-0 h-20 w-full rounded-t-[55%] bg-[#fbf7e8]" />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -32, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/15" />
            <div className="absolute -bottom-10 right-8 h-28 w-28 rounded-full bg-[#ef8219]/18" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-[10px] border-white bg-white shadow-[0_28px_70px_rgba(35,59,36,0.22)]">
              <Image
                src={heroImage}
                alt="Produits agricoles Solime"
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
              />
            </div>
            <div className="absolute -right-4 top-8 rounded-full bg-[#ef8219] px-5 py-4 text-center text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">Qualite</p>
              <p className="text-2xl font-black">100%</p>
            </div>
          </motion.div>

          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-4"
            >
              <SectionLabel>A propos de nous</SectionLabel>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-display text-5xl font-black leading-[0.95] text-primary md:text-7xl"
            >
              Agriculture
              <span className="mt-2 block text-primary">d&apos;excellence,</span>
              <span className="mt-2 block text-[#ef8219]">du champ a votre table</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mx-auto mt-7 max-w-xl rounded-2xl bg-white/90 p-5 text-sm leading-relaxed text-slate-600 shadow-[0_18px_45px_rgba(35,59,36,0.12)] lg:mx-0"
            >
              La Ferme Solime est la branche agrobusiness de Deal &amp; Consulting, specialisee
              dans la production et la distribution de produits agricoles de qualite pour le marche
              local et l&apos;export.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#ef8219] px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-primary hover:shadow-lg"
              >
                Explorer nos produits <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-black text-primary shadow-sm transition hover:bg-primary/5"
              >
                Nous contacter
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 px-6 lg:grid-cols-4">
          {[
            { value: "100%", label: "Tracabilite produit" },
            { value: "24/7", label: "Suivi des commandes" },
            { value: "Local", label: "Partenaires producteurs" },
            { value: "Pro", label: "Distribution B2B et export" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-primary/10 bg-white/90 px-5 py-5 text-center shadow-[0_14px_35px_rgba(35,59,36,0.10)]"
            >
              <p className="text-3xl font-black text-primary">{item.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full py-20 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative overflow-hidden border-y border-[#dbe5c8] bg-[#fbf7e8] shadow-[0_30px_80px_rgba(42,69,39,0.10)]"
        >
          <div className="absolute -top-12 left-0 h-28 w-[58%] rounded-br-[75%] bg-[#fde3c2]" />
          <div className="absolute -top-10 right-0 h-24 w-[54%] rounded-bl-[80%] bg-[#fff0db]" />
          <div className="absolute -bottom-24 right-[-4rem] h-64 w-64 rounded-full bg-[#f8cf9d]" />

          <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-14 md:px-10 md:py-16 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="space-y-6">
              <div>
                <SectionLabel>A propos de nous</SectionLabel>
                <h2 className="mt-3 max-w-md font-display text-3xl font-black leading-tight text-[#233b24] md:text-4xl">
                  Une agriculture structuree, fiable et ambitieuse
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#5a6d55] md:text-base">
                  Nous developpons une chaine de valeur agricole qui relie la production, la
                  transformation, la qualite et la distribution pour repondre aux besoins des
                  professionnels comme des particuliers.
                </p>
              </div>

              <div className="relative max-w-md overflow-hidden rounded-[1.5rem] border-8 border-white bg-white shadow-[0_20px_50px_rgba(42,69,39,0.16)]">
                <Image
                  src={detailImageOne}
                  alt="Produits agricoles frais"
                  className="h-52 w-full object-cover"
                  sizes="(min-width: 1024px) 420px, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#233b24]/80 to-transparent p-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-[#6f8b4f] px-5 py-2 text-xs font-black text-white shadow-lg transition hover:bg-[#547947]"
                  >
                    Nos produits
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#d7e4c5] bg-white/80 shadow-[0_18px_45px_rgba(42,69,39,0.15)] lg:h-36 lg:w-36">
              <div className="absolute inset-3 rounded-full bg-[#eef4e4]" />
              <Sprout className="relative h-14 w-14 text-[#547947] lg:h-16 lg:w-16" />
            </div>

            <div className="relative">
              <div className="mb-8">
                <SectionLabel>Nos engagements</SectionLabel>
                <h3 className="mt-3 font-display text-2xl font-black text-[#233b24] md:text-3xl">
                  La qualite a chaque etape
                </h3>
              </div>

              <div className="space-y-5">
                {PILLARS.map(({ icon: Icon, title, desc }, idx) => (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    custom={idx}
                    viewport={{ once: true }}
                    className="grid grid-cols-[2.75rem_1fr] gap-4 border-b border-[#d8e2c9] pb-5 last:border-b-0"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#6f8b4f] text-white shadow-[0_10px_24px_rgba(84,121,71,0.22)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[#e88923]">0{idx + 1}</span>
                        <h4 className="text-sm font-black text-[#233b24]">{title}</h4>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#64775f]">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <SectionLabel>Notre processus</SectionLabel>
              <SectionHeading className="mt-2">De la production a la distribution</SectionHeading>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative min-h-[460px] overflow-hidden rounded-2xl bg-[#547947] shadow-xl"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%),linear-gradient(90deg,rgba(239,130,25,0.18),transparent_48%)]" />
              <div className="absolute -left-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_28px_rgba(255,255,255,0.12)] md:-left-16 md:h-[34rem] md:w-[34rem]" />
              <div className="absolute -left-16 top-1/2 h-[21rem] w-[21rem] -translate-y-1/2 overflow-hidden rounded-full shadow-[0_24px_60px_rgba(15,20,55,0.25)] md:left-0 md:h-[27rem] md:w-[27rem]">
                <Image
                  src={detailImageOne}
                  alt="Production agricole"
                  fill
                  className="object-cover"
                  sizes="432px"
                />
              </div>

              <div className="relative z-10 ml-auto flex min-h-[460px] w-full flex-col justify-center px-6 py-10 md:w-[58%] md:px-12">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Notre processus
                </p>
                <h3 className="mt-3 max-w-md text-2xl font-black leading-tight text-white md:text-4xl">
                  De la production a la distribution
                </h3>

                <div className="mt-8 space-y-4">
                  {PROCESS_STEPS.map((step, i) => (
                    <motion.article
                      key={step.step}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      custom={i}
                      viewport={{ once: true }}
                      className="grid max-w-md grid-cols-[2.5rem_1fr] gap-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/12 text-sm font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{step.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-white/65">{step.desc}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded bg-white px-5 py-2.5 text-xs font-bold text-[#547947] transition hover:bg-white/90"
                  >
                    Voir nos produits <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded border border-white/25 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf7e8] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel>Programme de fidelite</SectionLabel>
              <SectionHeading className="mt-2">
                Des reductions progressives
                <br className="hidden sm:block" /> selon vos volumes d&apos;achat
              </SectionHeading>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 lg:text-right">
              Plus vous commandez, plus vous economisez. Le programme se calcule sur les achats
              mensuels cumules.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DISCOUNT_TIERS.map((tier, i) => (
              <motion.div
                key={tier.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                custom={i}
                viewport={{ once: true }}
                className="flex flex-col justify-between rounded-xl border border-border bg-white p-5"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {tier.title}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">{tier.range}</p>
                </div>
                <p className="mt-6 text-3xl font-bold text-slate-900">{tier.discount}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <SectionLabel>Temoignages</SectionLabel>
          <SectionHeading className="mt-2">Ce que disent nos partenaires</SectionHeading>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map(({ role, icon: Icon, text }, i) => (
            <motion.article
              key={role}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              custom={i}
              viewport={{ once: true }}
              className="flex flex-col rounded-2xl border border-border bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{role}</p>
                  <div className="mt-0.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">
                &quot;{text}&quot;
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-[#fbf7e8] py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            <SectionLabel>Restez informe</SectionLabel>
            <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
              Recevez nos offres et actualites
            </h2>
            <p className="text-sm text-slate-500">
              Inscrivez-vous pour etre informe de nos nouvelles collections, promotions et
              actualites de la ferme.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
            >
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
