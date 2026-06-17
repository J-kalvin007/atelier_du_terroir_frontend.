"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { ClientAccountShell } from "@/components/dashboard/ClientAccountShell";
import { useAuthSession } from "@/components/auth/useAuthSession";

type LoyaltyProfile = {
  tier_name?: string;
  points_balance?: number;
  total_points_earned?: number;
  total_solde?: string;
};

export default function LoyaltyPage() {
  const session = useAuthSession();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      return;
    }

    void fetch("/api/v1/fidelites/mon-profil-fidelite/", {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${session.token}`,
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Profil fidelite indisponible");
        return response.json() as Promise<LoyaltyProfile>;
      })
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [session?.token]);

  return (
    <ClientAccountShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Star className="h-7 w-7 text-[#ef8219]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1f241c]">Ma fidelite</h1>
            <p className="text-sm text-[#5c6a59]">Points, palier et avantages.</p>
          </div>
        </div>

        {!session?.token ? (
          <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
            <p className="text-sm text-[#5c6a59]">Connectez-vous pour voir votre programme de fidelite.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-[#ef8219] px-5 py-2 text-sm font-semibold text-white">
              Connexion
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16 text-[#8b5e34]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error || !profile ? (
          <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
            <p className="text-sm text-[#5c6a59]">
              {error || "Aucun profil fidelite actif pour ce compte."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Palier" value={profile.tier_name || "Bronze"} />
            <StatCard label="Points disponibles" value={`${profile.points_balance ?? 0} pts`} />
            <StatCard label="Total gagnes" value={`${profile.total_points_earned ?? 0} pts`} />
          </div>
        )}
      </div>
    </ClientAccountShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadcca] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b5e34]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#1f241c]">{value}</p>
    </div>
  );
}
