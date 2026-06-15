"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpLeft,
  Loader2,
  Lock,
  Unlock,
  Coins,
  History,
  Send,
  CheckCircle,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  adminWithdrawFunds,
  getAdminAllTransactions,
  getAdminAllWallets,
  updateAdminWalletStatus,
  type AdminTransaction,
  type AdminWallet,
} from "@/lib/ecommerce-api";
import { formatCurrency, readApiError } from "@/lib/utils";

export default function WalletSection() {
  const session = useAuthSession();
  const [tab, setTab] = useState<"wallets" | "transactions" | "withdraw">("wallets");
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawDesc, setWithdrawDesc] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Status Change State
  const [updatingWalletId, setUpdatingWalletId] = useState<string | null>(null);

  const loadData = async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);
    try {
      const [walletsData, transactionsData] = await Promise.all([
        getAdminAllWallets(session.token),
        getAdminAllTransactions(session.token),
      ]);
      setWallets(walletsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Error loading wallet admin data:", err);
      setError(readApiError(err, "Impossible de charger les donnees financieres."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  const handleStatusChange = async (walletId: string, currentBalance: string, newStatus: "active" | "suspendu" | "blocked") => {
    if (!session?.token) return;
    
    // Check if solde is 0 before closing/blocking as per rules if needed
    const balanceNum = parseFloat(currentBalance);
    if (newStatus !== "active" && balanceNum > 0) {
      if (!confirm("Attention: Le solde du wallet est superieur a 0. Es-tu sur de vouloir suspendre/bloquer ce compte ?")) {
        return;
      }
    }

    setUpdatingWalletId(walletId);
    setError(null);
    try {
      await updateAdminWalletStatus(session.token, walletId, newStatus);
      await loadData();
    } catch (err) {
      console.error("Error updating wallet status:", err);
      setError(readApiError(err, "Impossible de modifier le statut du wallet."));
    } finally {
      setUpdatingWalletId(null);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;
    
    setSubmittingWithdraw(true);
    setError(null);
    setWithdrawSuccess(false);

    try {
      await adminWithdrawFunds(session.token, {
        amount: withdrawAmount.trim(),
        phone_number: withdrawPhone.trim(),
        description: withdrawDesc.trim() || "Retrait mobile money administrateur",
      });

      setWithdrawSuccess(true);
      setWithdrawAmount("");
      setWithdrawPhone("");
      setWithdrawDesc("");
      await loadData();
    } catch (err) {
      console.error("Error executing withdrawal:", err);
      setError(readApiError(err, "Echec de la demande de retrait de fonds."));
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // Compute metrics
  const totalBalance = wallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
  const totalWithdrawals = transactions
    .filter((t) => t.type_label?.toLowerCase().includes("retrait") || t.amount.startsWith("-"))
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Finances
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Wallet className="h-6 w-6 text-[#8b5e34]" /> Gestion des Portefeuilles (Wallet)
          </h1>
          <p className="text-sm text-slate-500">
            Suis les soldes, valide les retraits et surveille les transactions de la plateforme.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Solde Total Cumule (Clients)
            </span>
            <Coins className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalBalance, "FCFA")}
          </p>
          <p className="mt-1 text-xs text-slate-400">Soldes gardes sur les wallets</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Retraits Executes
            </span>
            <ArrowUpLeft className="h-5 w-5 text-[#8b5e34]" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalWithdrawals, "FCFA")}
          </p>
          <p className="mt-1 text-xs text-slate-400">Retraits de fonds de la plateforme</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Wallets Enregistres
            </span>
            <Wallet className="h-5 w-5 text-[#8b5e34]" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{wallets.length}</p>
          <p className="mt-1 text-xs text-slate-400">Comptes avec recharge active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {[
          { key: "wallets" as const, label: "Wallets Clients" },
          { key: "transactions" as const, label: "Transactions Globales" },
          { key: "withdraw" as const, label: "Retrait de fonds (Admin)" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === item.key
                ? "border-[#8b5e34] text-[#8b5e34]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : tab === "wallets" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 text-right">Solde Actuel</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucun wallet client trouve.
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {wallet.user_name || "Client"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {wallet.user_email}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700">
                        {formatCurrency(wallet.balance, "FCFA")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            wallet.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : wallet.status === "suspendu"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {wallet.status === "active"
                            ? "Actif"
                            : wallet.status === "suspendu"
                              ? "Suspendu"
                              : "Bloque"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {updatingWalletId === wallet.id ? (
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                        ) : (
                          <div className="flex justify-center gap-2">
                            <select
                              value={wallet.status}
                              onChange={(e) =>
                                void handleStatusChange(
                                  wallet.id,
                                  wallet.balance,
                                  e.target.value as any
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#8b5e34]"
                            >
                              <option value="active">Activer</option>
                              <option value="suspendu">Suspendre</option>
                              <option value="blocked">Bloquer</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "transactions" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Mode/Passerelle</th>
                  <th className="px-6 py-3 text-right">Montant</th>
                  <th className="px-6 py-3">Ref Externe</th>
                  <th className="px-6 py-3">Commande</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucune transaction trouvee.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isNegative = tx.amount.startsWith("-");
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString("fr-FR") : "-"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {tx.type_label || "Transaction"}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 uppercase">
                          {tx.provider_label || "PayDunya"}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${
                            isNegative ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {tx.amount} FCFA
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[150px]">
                          {tx.reference_externe || "-"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {tx.order_reference || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              tx.status_label?.toLowerCase().includes("reuss") || tx.status_label?.toLowerCase().includes("paid")
                                ? "bg-emerald-50 text-emerald-700"
                                : tx.status_label?.toLowerCase().includes("attente") || tx.status_label?.toLowerCase().includes("pend")
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {tx.status_label || "Inconnu"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Demander un Retrait Admin</h3>
          <p className="text-xs text-slate-500 mb-6">
            Transfere des fonds de la plateforme vers un compte Mobile Money (Orange Money, Wave, Free Money, etc.).
          </p>

          {withdrawSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Demande de retrait enregistree avec succes!</p>
                <p className="text-xs mt-1">Le paiement est en cours de traitement par l&apos;operateur.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Montant (FCFA) *</label>
              <input
                required
                type="number"
                min="100"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Ex: 5000"
                className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Numero de telephone destinataire *
              </label>
              <input
                required
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="Ex: +221771234567"
                className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm font-mono outline-none focus:border-[#8b5e34]"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Format international requis (+221, +225, etc.).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description *</label>
              <input
                required
                type="text"
                value={withdrawDesc}
                onChange={(e) => setWithdrawDesc(e.target.value)}
                placeholder="Ex: Facture fournisseur XYZ, Provision caisse..."
                className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingWithdraw || !withdrawAmount.trim() || !withdrawPhone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5e34] py-3 text-sm font-semibold text-white transition-all hover:bg-[#744b27] disabled:opacity-60"
            >
              {submittingWithdraw ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Initier le Retrait Mobile Money
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
