import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="relative overflow-hidden bg-[#f6f1e8] text-[#1f241c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.18),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(31,77,63,0.16),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.7),_rgba(246,241,232,0.96))]" />
      <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#dcb98e]/35 blur-3xl" />
      <div className="absolute right-[-7rem] top-40 h-80 w-80 rounded-full bg-[#83a07a]/25 blur-3xl" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d9c5aa] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b5e34] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#1f4d3f]" />
            Authentification
          </div>

          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Connexion a la plateforme.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#52604e]">
              Une seule connexion pour tous. Apres authentification, les admins vont sur le
              dashboard <strong>/admin</strong>, les clients sur la boutique.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
            >
              Dashboard admin
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] hover:border-[#8b5e34] hover:text-[#8b5e34]"
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
        </div>

        <div className="relative">
          <Suspense
            fallback={
              <div className="h-[38rem] w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(24,37,24,0.12)]" />
            }
          >
            <AuthForm redirectPath={params?.redirect} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
