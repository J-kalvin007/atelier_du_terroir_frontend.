"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { ClientAccountShell } from "@/components/dashboard/ClientAccountShell";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getWalletBalance, getWalletTransactions } from "@/lib/ecommerce-api";
import { formatCurrency } from "@/lib/utils";

export default function WalletPage() {
  const session = useAuthSession();
  const [balance, setBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [transactions, setTransactions] = useState<Array<{ id: string; amount: string; reference?: string; created_at?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      return;
    }

    void Promise.allSettled([
      getWalletBalance(session.token),
      getWalletTransactions(session.token),
    ]).then(([balanceResult, txResult]) => {
      if (balanceResult.status === "fulfilled") {
        setBalance(balanceResult.value.balance);
        setStatus(balanceResult.value.status || "active");
      }
      if (txResult.status === "fulfilled") {
        setTransactions(txResult.value);
      }
      setLoading(false);
    });
  }, [session?.token]);

  return (
    <ClientAccountShell>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Wallet className="h-7 w-7 text-[#ef8219]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1f241c]">Mon portefeuille</h1>
            <p className="text-sm text-[#5c6a59]">Solde et historique des transactions.</p>
          </div>
        </div>

        {!session?.token ? (
          <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
            <p className="text-sm text-[#5c6a59]">Connectez-vous pour acceder a votre wallet.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-[#ef8219] px-5 py-2 text-sm font-semibold text-white">
              Connexion
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16 text-[#8b5e34]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-[#1f4d3f] p-8 text-white">
              <p className="text-sm text-white/70">Solde disponible</p>
              <p className="mt-2 text-4xl font-extrabold">
                {formatCurrency(parseFloat(balance || "0"), "FCFA")}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-white/60">Statut : {status}</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1f241c]">Historique</h2>
              {transactions.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-[#eadcca] bg-white p-6 text-sm text-[#5c6a59]">
                  Aucune transaction enregistree.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="rounded-xl border border-[#eadcca] bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[#1f241c]">{tx.reference || tx.id}</p>
                        <p className="text-sm font-bold text-[#ef8219]">
                          {formatCurrency(parseFloat(tx.amount), "FCFA")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientAccountShell>
  );
}
