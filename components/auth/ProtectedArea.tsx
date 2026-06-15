"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  refreshSessionFromProfile,
  UserRole,
  getDashboardPath,
} from "@/lib/auth";
import { useAuthSession } from "@/components/auth/useAuthSession";

type ProtectedAreaProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function ProtectedArea({ allowedRole, children }: ProtectedAreaProps) {
  const router = useRouter();
  const session = useAuthSession();
  const adminRefreshAttemptedRef = useRef(false);
  const [adminRefreshResolved, setAdminRefreshResolved] = useState(false);

  useEffect(() => {
    if (!session) {
      adminRefreshAttemptedRef.current = false;
      if (allowedRole === "admin") {
        return;
      }
      router.replace(`/login?redirect=/${allowedRole}`);
      return;
    }

    if (allowedRole === "admin" && session.role !== "admin") {
      if (adminRefreshAttemptedRef.current) {
        return;
      }

      adminRefreshAttemptedRef.current = true;

      void refreshSessionFromProfile(session)
        .then((refreshedSession) => {
          if (refreshedSession.role !== "admin") {
            setAdminRefreshResolved(true);
          }
        })
        .catch(() => {
          setAdminRefreshResolved(true);
        });

      return;
    }

    adminRefreshAttemptedRef.current = false;

    if (session.role !== allowedRole && allowedRole !== "admin") {
      router.replace(getDashboardPath(session.role));
    }
  }, [allowedRole, router, session]);

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f1e7] px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,94,52,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,77,63,0.18),_transparent_26%)]" />
        <div className="absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-[#d7c1a2]/40 blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] h-72 w-72 rounded-full bg-[#8aa37f]/30 blur-3xl" />

        <div className="relative w-full max-w-3xl rounded-[2rem] border border-black/10 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(24,37,24,0.12)] backdrop-blur lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8b5e34]">
            {allowedRole === "admin" ? "Espace admin" : "Redirection"}
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#1b2118]">
            {allowedRole === "admin"
              ? "Bienvenue sur le dashboard administrateur."
              : `Ouverture de la page d'authentification commune pour l'espace ${allowedRole}.`}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#4f5e4a]">
            {allowedRole === "admin"
              ? "Tu peux ouvrir la connexion commune avec le bouton ci-dessous. Une fois authentifie en tant qu'admin, tu reviendras directement ici sur `/admin`."
              : "Apres connexion, un utilisateur admin reviendra automatiquement sur l'espace admin, et un client sur l'espace client."}
          </p>

          <div className="mt-6">
            <Link
              className="rounded-2xl bg-[#1f4d3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17392f]"
              href={`/login?redirect=/${allowedRole}`}
            >
              {allowedRole === "admin" ? "Se connecter" : "Continuer"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (
    allowedRole === "admin" &&
    session.role !== "admin" &&
    !adminRefreshResolved
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">
          Verification du profil administrateur aupres de l&apos;API...
        </p>
      </div>
    );
  }

  if (session.role !== allowedRole) {
    if (allowedRole === "admin") {
      const currentRole = session.user.raw.role;
      const roleLabel =
        typeof currentRole === "string" && currentRole.trim().length > 0
          ? currentRole
          : session.role;

      return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f1e7] px-6 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,94,52,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,77,63,0.18),_transparent_26%)]" />
          <div className="absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-[#d7c1a2]/40 blur-3xl" />
          <div className="absolute bottom-0 right-[-4rem] h-72 w-72 rounded-full bg-[#8aa37f]/30 blur-3xl" />

          <div className="relative w-full max-w-3xl rounded-[2rem] border border-black/10 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(24,37,24,0.12)] backdrop-blur lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8b5e34]">
              Acces admin requis
            </p>
            <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#1b2118]">
              Tu es connecte, mais ce compte n&apos;est pas reconnu comme administrateur.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#4f5e4a]">
              Le backend doit renvoyer `role: &quot;platform_admin&quot;` ou un attribut admin equivalent
              pour ouvrir `/admin`.
            </p>

            <div className="mt-6 rounded-[1.25rem] border border-[#ead8c3] bg-[#fff7f1] px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
                Role actuel detecte
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1f241c]">{roleLabel}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                className="rounded-2xl bg-[#1f4d3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17392f]"
                type="button"
                onClick={() => {
                  clearSession();
                  router.replace("/login?redirect=/admin");
                }}
              >
                Se reconnecter en admin
              </button>
              <Link
                className="rounded-2xl border border-[#d8c4ab] px-6 py-3 text-sm font-semibold text-[#1f4d3f] transition hover:border-[#8b5e34] hover:text-[#8b5e34]"
                href="/"
              >
                Retour accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Verification de la session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
