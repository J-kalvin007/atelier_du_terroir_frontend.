"use client";

import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const benefits = [
  "Compte unique pour commander depuis mobile, tablette ou ordinateur",
  "Acces au wallet pour deposer des fonds et payer progressivement",
  "Suivi des commandes, livraisons et historiques d'achat",
  "Statuts de fidelite evolutifs avec reductions et cashback",
];

export function RegisterPageView() {
  return (
    <AuthPageShell
      badge="Ouverture de compte"
      sidePanel={
        <section className="rounded-[2rem] border border-[#e4d7c7] bg-white/82 p-6 shadow-[0_24px_60px_rgba(58,42,18,0.08)] backdrop-blur">
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
      }
      formPanel={
        <Suspense
          fallback={
            <div className="h-[40rem] w-full animate-pulse rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(24,37,24,0.12)]" />
          }
        >
          <RegisterForm />
        </Suspense>
      }
    />
  );
}
