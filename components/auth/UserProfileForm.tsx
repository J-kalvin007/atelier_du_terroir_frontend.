"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Loader2, Save, UserRound } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getSessionRoleLabel, hasAdminAccess, updateUserProfile } from "@/lib/auth";

export function UserProfileForm() {
  const session = useAuthSession();
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session) {
      return;
    }

    setName(session.user.name ?? session.user.username ?? "");
    setFirstName(session.user.firstName ?? "");
    setLastName(session.user.lastName ?? "");
  }, [session]);

  if (!session?.token) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Connecte-toi pour gerer ton profil utilisateur.
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      return;
    }

    const activeSession = session;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await updateUserProfile(activeSession, {
          name,
          first_name: firstName,
          last_name: lastName,
        });
        setSuccess(true);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Impossible de mettre a jour le profil."
        );
      }
    });
  }

  const roleLabel = getSessionRoleLabel(session);
  const adminAccess = hasAdminAccess(session);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8ecdf] text-[#8b5e34]">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Profil utilisateur</h2>
          <p className="mt-1 text-sm text-slate-500">
            Donnees synchronisees via <code className="text-xs">/api/auth/user/</code>. Email en
            lecture seule.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-[#eadfce] bg-[#fffaf4] p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-1 font-medium text-slate-900">{session.user.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role API</p>
          <p className="mt-1 font-medium text-slate-900">
            {roleLabel}
            {adminAccess ? " (admin)" : " (client)"}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profil mis a jour avec succes.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Prenom</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Nom de famille</label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f4d3f] py-3 text-sm font-semibold text-white transition hover:bg-[#17392f] disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer le profil
        </button>
      </form>
    </div>
  );
}
