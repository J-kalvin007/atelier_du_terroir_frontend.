"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthSession,
  clearSession,
  hasAdminAccess,
  refreshSessionFromProfile,
  UserRole,
} from "@/lib/auth";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { AdminAuthPanel } from "@/components/auth/AdminAuthPanel";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

type ProtectedAreaProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

function isSessionAllowed(session: AuthSession, allowedRole: UserRole) {
  if (allowedRole === "admin") {
    return hasAdminAccess(session);
  }

  return session.role === allowedRole;
}

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

    if (isSessionAllowed(session, allowedRole)) {
      adminRefreshAttemptedRef.current = false;
      setAdminRefreshResolved(false);
      return;
    }

    if (allowedRole === "admin" && !hasAdminAccess(session)) {
      if (!adminRefreshAttemptedRef.current) {
        adminRefreshAttemptedRef.current = true;

        void refreshSessionFromProfile(session)
          .then((refreshedSession) => {
            if (hasAdminAccess(refreshedSession)) {
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
    if (!mounted || allowedRole !== "admin" || !session) {
      return;
    }

    if (hasAdminAccess(session)) {
      return;
    }

    if (!adminRefreshResolved) {
      return;
    }

    clearSession();
    adminRefreshAttemptedRef.current = false;
    setAdminRefreshResolved(false);
  }, [allowedRole, adminRefreshResolved, mounted, session]);

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
      <AuthPageShell
        badge="Administration"
        title="Connexion dashboard admin"
        description="Connecte-toi avec un compte platform_admin pour acceder au dashboard et gerer la boutique."
        sidePanel={
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 text-sm text-slate-600 backdrop-blur">
              Compte avec role <strong>platform_admin</strong> requis pour les actions API (commandes,
              CRUD catalogue).
            </div>
            <Link href="/" className="inline-flex text-sm font-medium text-[#8b5e34] hover:underline">
              Retour boutique
            </Link>
          </div>
        }
        formPanel={<AdminAuthPanel />}
      />
    );
  }

  if (!session && allowedRole !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Redirection connexion...</p>
      </div>
    );
  }

  if (session && isSessionAllowed(session, allowedRole)) {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  if (allowedRole === "admin" && !hasAdminAccess(session) && !adminRefreshResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Verification du role administrateur...</p>
      </div>
    );
  }

  if (allowedRole === "admin" && session && !hasAdminAccess(session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Preparation de la connexion admin...</p>
      </div>
    );
  }

  if (session && !isSessionAllowed(session, allowedRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7] px-6">
        <p className="text-sm text-[#4f5e4a]">Redirection...</p>
      </div>
    );
  }

  return <>{children}</>;
}
