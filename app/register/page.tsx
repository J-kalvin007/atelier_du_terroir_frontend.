import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

const benefits = [
  "Compte unique pour commander depuis mobile, tablette ou ordinateur",
  "Acces au wallet pour deposer des fonds et payer progressivement",
  "Suivi des commandes, livraisons et historiques d'achat",
  "Statuts de fidelite evolutifs avec reductions et cashback",
];

export default function RegisterPage() {
  return (
    <main className="relative overflow-hidden bg-[#f6f1e8] text-[#1e241d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(31,77,63,0.15),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(246,241,232,0.98))]" />
      <div className="absolute left-[-6rem] top-16 h-72 w-72 rounded-full bg-[#d9b487]/30 blur-3xl" />
      <div className="absolute bottom-0 right-[-4rem] h-72 w-72 rounded-full bg-[#92ab85]/24 blur-3xl" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c2a7] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b5e34] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#1f4d3f]" />
            Ouverture de compte
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Rejoins la plateforme et accede au parcours e-commerce complet.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#53604e]">
              Les utilisateurs s&apos;inscrivent une seule fois, puis se connectent via la meme
              page d&apos;authentification. Le role renvoye par l&apos;API decide ensuite
              automatiquement de l&apos;espace client ou admin.
            </p>
          </div>

          <section className="rounded-[2rem] border border-[#e4d7c7] bg-white/80 p-6 shadow-[0_24px_60px_rgba(58,42,18,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                  Pourquoi creer un compte
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Une experience centralisee</h2>
              </div>
              <Link
                href="/login"
                className="rounded-full border border-[#d8c4ab] px-4 py-2 text-sm font-semibold text-[#1f4d3f] transition hover:border-[#8b5e34] hover:text-[#8b5e34]"
              >
                Retour connexion
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[#efe5d8] bg-[#fbf7f1] px-4 py-4 text-sm leading-7 text-[#5a6755]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="relative">
          <div className="absolute inset-x-12 top-10 h-28 rounded-full bg-[#8b5e34]/18 blur-3xl" />
          <Suspense
            fallback={
              <div className="h-[40rem] w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(24,37,24,0.12)]" />
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
