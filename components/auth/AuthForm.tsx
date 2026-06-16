"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  applyPostLoginRedirect,
  hasAdminAccess,
  login,
} from "@/lib/auth";

function AuthFormSkeleton() {
  return (
    <div className="relative w-full max-w-md">
      <div className="h-[38rem] animate-pulse overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
        <div className="h-40 bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34]" />
        <div className="space-y-4 p-8">
          <div className="h-16 rounded-xl bg-[#f3faf5]" />
          <div className="h-12 rounded-xl bg-[#fbfcf7]" />
          <div className="h-12 rounded-xl bg-[#fbfcf7]" />
          <div className="h-12 rounded-xl bg-[#1f4d3f]/20" />
        </div>
      </div>
    </div>
  );
}

export function AuthForm({
  redirectPath,
  embedded = false,
  onSwitchToRegister,
  registerHref = "/register",
}: {
  redirectPath?: string;
  embedded?: boolean;
  onSwitchToRegister?: () => void;
  registerHref?: string;
} = {}) {
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const [mounted, setMounted] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const requestedRedirect = redirectPath ?? searchParams.get("redirect");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !session || embedded) {
      return;
    }

    if (requestedRedirect) {
      applyPostLoginRedirect(session, requestedRedirect);
      return;
    }

    if (hasAdminAccess(session)) {
      applyPostLoginRedirect(session, "/admin");
    }
  }, [embedded, mounted, requestedRedirect, session]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const newSession = await login(identifier, password);

        if (embedded) {
          return;
        }

        applyPostLoginRedirect(
          newSession,
          requestedRedirect ?? (hasAdminAccess(newSession) ? "/admin" : null)
        );
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Une erreur est survenue pendant la connexion."
        );
      }
    });
  }

  if (!mounted) {
    return <AuthFormSkeleton />;
  }

  if (session) {
    if (embedded) {
      return null;
    }

    const returningToAdmin = requestedRedirect?.startsWith("/admin");

    return (
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white p-8 text-center shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
          <p className="text-sm text-[#24573f]">
            {returningToAdmin || hasAdminAccess(session)
              ? "Redirection vers le dashboard admin..."
              : "Redirection vers la boutique..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
        <div className="bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 text-2xl backdrop-blur-sm">
            C
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-white/82">
            Connexion unique. Le role API decide de la destination : admin → dashboard, client →
            boutique.
          </p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-[#cfe0d4] bg-[#f3faf5] px-4 py-3 text-sm text-[#24573f]">
            Connecte-toi avec ton email et mot de passe. Compte admin (platform_admin) →{" "}
            <strong>/admin</strong>. Compte client → <strong>boutique</strong>.
          </div>

          {error ? (
            <div className="rounded-xl border border-[#f0b7b7] bg-[#fff4f4] px-4 py-3 text-sm text-[#9a2f2f]">
              {error}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#2a3528]">Email ou identifiant</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978]">
                @
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
                *
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
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
          </label>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </button>

          {onSwitchToRegister ? (
            <p className="text-center text-sm text-[#667260]">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-[#1f4d3f] hover:underline"
              >
                Creer un compte
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-[#667260]">
              Pas encore de compte ?{" "}
              <Link className="font-semibold text-[#1f4d3f] hover:underline" href={registerHref}>
                Creer un compte
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

