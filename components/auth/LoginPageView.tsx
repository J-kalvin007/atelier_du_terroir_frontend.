"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export function LoginPageView({ redirectPath }: { redirectPath?: string }) {
  return (
    <AuthPageShell
      badge="Authentification"
      title="Connexion a la plateforme."
      description="Une seule connexion pour tous. Apres authentification, les admins vont sur /admin, les clients sur /dashboard."
      sidePanel={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] backdrop-blur hover:border-[#8b5e34] hover:text-[#8b5e34]"
          >
            Retour accueil
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#1f4d3f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173a30]"
          >
            Creer un compte
          </Link>
        </div>
      }
      formPanel={
        <Suspense
          fallback={
            <div className="h-[38rem] w-full animate-pulse rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(24,37,24,0.12)]" />
          }
        >
          <AuthForm redirectPath={redirectPath} />
        </Suspense>
      }
    />
  );
}
