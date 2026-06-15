"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getDashboardPath, login, readSession } from "@/lib/auth";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const requestedRedirect = searchParams.get("redirect");
  const hasClientSessionOnAdminRoute =
    requestedRedirect === "/admin" && readSession()?.role === "client";
  const adminSessionHint = hasClientSessionOnAdminRoute
    ? "Un compte client est deja ouvert sur ce navigateur. Deconnecte-toi puis reconnecte-toi avec un compte admin."
    : null;

  useEffect(() => {
    const session = readSession();

    if (!session || !requestedRedirect) {
      return;
    }

    if (requestedRedirect === "/admin") {
      return;
    }

    router.replace(resolveRedirectPath(session.role, requestedRedirect));
  }, [requestedRedirect, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const session = await login(identifier, password);
        if (requestedRedirect === "/admin") {
          router.replace("/admin");
          return;
        }

        router.replace(resolveRedirectPath(session.role, requestedRedirect));
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Une erreur est survenue pendant la connexion."
        );
      }
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
        <div className="bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 text-2xl backdrop-blur-sm">
            ✨
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-white/82">
            Connectez-vous avec votre email ou votre identifiant
          </p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleSubmit}>
          {requestedRedirect === "/admin" ? (
            <div className="rounded-xl border border-[#d6c7b3] bg-[#fbf4ea] px-4 py-3 text-sm text-[#7a5530]">
              Connexion admin demandee: si l&apos;API reconnait ce compte comme administrateur,
              il sera envoye directement vers `/admin`.
            </div>
          ) : null}

          {error || adminSessionHint ? (
            <div className="rounded-xl border border-[#f0b7b7] bg-[#fff4f4] px-4 py-3 text-sm text-[#9a2f2f]">
              {error ?? adminSessionHint}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Email ou identifiant</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978]">
                👤
              </span>
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                name="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                placeholder="yan ou yan@gmail.com"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Mot de passe</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978]">
                🔒
              </span>
              <input
                className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978] hover:text-[#1f4d3f]"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
            {isPending ? null : <span aria-hidden="true">→</span>}
          </button>

          <p className="text-center text-sm text-[#667260]">
            Pas encore de compte ?{" "}
            <Link className="font-semibold text-[#1f4d3f] hover:underline" href="/register">
              Creer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function resolveRedirectPath(
  role: "admin" | "client",
  requestedRedirect: string | null
) {
  if (requestedRedirect === "/admin" && role === "admin") {
    return "/admin";
  }

  if (requestedRedirect === "/client" && role === "client") {
    return "/";
  }

  return getDashboardPath(role);
}
