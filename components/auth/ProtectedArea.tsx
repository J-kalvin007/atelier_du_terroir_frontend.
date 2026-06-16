"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  refreshSessionFromProfile,
  UserRole,
} from "@/lib/auth";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { AdminAuthPanel } from "@/components/auth/AdminAuthPanel";

type ProtectedAreaProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function ProtectedArea({ allowedRole, children }: ProtectedAreaProps) {
  const router = useRouter();
  const session = useAuthSession();
  const [mounted, setMounted] = useState(false);
  const adminRefreshAttemptedRef = useRef(false);
  const [adminRefreshResolved, setAdminRefreshResolved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!session) {
      adminRefreshAttemptedRef.current = false;
      setAdminRefreshResolved(false);
      return;
    }

    if (session.role === allowedRole) {
      adminRefreshAttemptedRef.current = false;
      setAdminRefreshResolved(false);
      return;
    }

    if (allowedRole === "admin" && session.role === "client") {
      if (!adminRefreshAttemptedRef.current) {
        adminRefreshAttemptedRef.current = true;

        void refreshSessionFromProfile(session)
          .then((refreshedSession) => {
            if (refreshedSession.role === "admin") {
              adminRefreshAttemptedRef.current = false;
              setAdminRefreshResolved(false);
              return;
            }

            setAdminRefreshResolved(true);
          })
          .catch(() => {
            setAdminRefreshResolved(true);
          });
      }
    }
  }, [allowedRole, mounted, session]);

  useEffect(() => {
    if (!mounted || session || allowedRole === "admin") {
      return;
    }

    router.replace("/login");
  }, [allowedRole, mounted, router, session]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Chargement...</p>
      </div>
    );
  }

  if (!session && allowedRole === "admin") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4efe6] px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,94,52,0.18),_transparent_32%)]" />
        <div className="relative w-full max-w-lg space-y-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
              Administration
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Dashboard admin</h1>
            <p className="mt-2 text-sm text-slate-500">
              Connexion reservee aux comptes avec le role <strong>platform_admin</strong>.
            </p>
          </div>
          <AdminAuthPanel />
          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-[#8b5e34] hover:underline">
              Retour boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session && allowedRole !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Redirection connexion...</p>
      </div>
    );
  }

  if (session?.role === allowedRole) {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  if (allowedRole === "admin" && session.role !== "admin" && !adminRefreshResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">
          Verification du role administrateur...
        </p>
      </div>
    );
  }

  if (allowedRole === "admin" && session.role !== "admin") {
    const roleLabel =
      typeof session.user.raw.role === "string" && session.user.raw.role.trim().length > 0
        ? session.user.raw.role
        : session.role;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-[#eadfce] bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
            Acces admin refuse
          </p>
          <p className="text-sm leading-7 text-[#4f5e4a]">
            Ton compte a le role <strong>{roleLabel}</strong>. Seuls les comptes{" "}
            <strong>platform_admin</strong> peuvent ouvrir le dashboard sur{" "}
            <strong>/admin</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/"
              className="rounded-xl bg-[#1f4d3f] px-4 py-2 text-sm font-semibold text-white"
            >
              Retour boutique
            </Link>
            <button
              type="button"
              className="rounded-xl border border-[#d8c4ab] px-4 py-2 text-sm font-semibold text-[#1f4d3f]"
              onClick={() => {
                clearSession();
                window.location.assign("/admin");
              }}
            >
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.role !== allowedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Redirection...</p>
      </div>
    );
  }

  return <>{children}</>;
}
