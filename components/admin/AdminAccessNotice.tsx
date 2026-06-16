"use client";

import { useAuthSession } from "@/components/auth/useAuthSession";
import { getSessionRoleLabel } from "@/lib/auth";

export function AdminAccessNotice({
  title = "Droits admin insuffisants",
  description,
  onSwitchAccount,
}: {
  title?: string;
  description?: string;
  onSwitchAccount?: () => void;
}) {
  const session = useAuthSession();
  const roleLabel = getSessionRoleLabel(session);
  const email = session?.user.email ?? "ton-email@example.com";

  const messageForBackend = `Promouvoir mon compte en platform_admin : ${email}`;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 leading-6 text-amber-900/90">
        Role actuel : <strong>{roleLabel}</strong>
        {session?.user.email ? (
          <>
            {" "}
            — compte : <strong>{session.user.email}</strong>
          </>
        ) : null}
        .
      </p>
      {description ? (
        <p className="mt-2 leading-6 text-amber-900/90">{description}</p>
      ) : (
        <p className="mt-2 leading-6 text-amber-900/90">
          L&apos;API Django n&apos;accepte que le role <strong>platform_admin</strong> pour les
          actions admin (commandes, CRUD catalogue). Ce n&apos;est pas un bug du frontend.
        </p>
      )}

      <div className="mt-4 rounded-xl border border-amber-300/60 bg-white/70 p-3 text-xs text-amber-950">
        <p className="font-semibold">Message a envoyer au responsable backend :</p>
        <p className="mt-2 font-mono leading-6">{messageForBackend}</p>
        <p className="mt-3 leading-6 text-amber-900/90">
          Commande Django :{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5">
            python manage.py set_platform_admin {email} --staff
          </code>
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs leading-6 text-amber-900/90">
        <p>
          <strong>Apres promotion :</strong> deconnexion → reconnexion sur{" "}
          <code>/admin</code> → verifier sur <code>/account</code> que le role affiche{" "}
          <strong>platform_admin</strong>.
        </p>
      </div>

      {onSwitchAccount ? (
        <button
          type="button"
          onClick={onSwitchAccount}
          className="mt-4 inline-flex rounded-xl bg-[#1f4d3f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#17392f]"
        >
          Changer de compte
        </button>
      ) : null}
    </div>
  );
}
