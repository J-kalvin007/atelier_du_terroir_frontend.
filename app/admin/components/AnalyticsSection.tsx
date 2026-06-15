"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Loader2, Award, ArrowDownRight, ArrowUpLeft } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getAdminOrders, getAdminAllTransactions, getAdminAllWallets, type OrderSummary, type AdminTransaction, type AdminWallet } from "@/lib/ecommerce-api";
import { formatCurrency, readApiError } from "@/lib/utils";

export default function AnalyticsSection() {
  const session = useAuthSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersData, transactionsData, walletsData] = await Promise.all([
        getAdminOrders(session.token),
        getAdminAllTransactions(session.token),
        getAdminAllWallets(session.token),
      ]);
      setOrders(ordersData);
      setTransactions(transactionsData);
      setWallets(walletsData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setError(readApiError(err, "Impossible de charger les donnees analytiques."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  const metrics = useMemo(() => {
    const totalSales = orders
      .filter(o => ["paid", "confirmed", "processing", "shipped", "delivered"].includes(o.status.toLowerCase()))
      .reduce((sum, o) => sum + (parseFloat(o.total_final) || 0), 0);

    const pendingSales = orders
      .filter(o => ["pending_payment", "draft"].includes(o.status.toLowerCase()))
      .reduce((sum, o) => sum + (parseFloat(o.total_final) || 0), 0);

    const totalWalletsDeposit = transactions
      .filter(t => t.type_label?.toLowerCase().includes("deposit") || t.type_label?.toLowerCase().includes("recharge"))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // Order status counts
    const statusCounts = orders.reduce((acc, o) => {
      const status = o.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Provider popularity
    const providerCounts = transactions.reduce((acc, t) => {
      const provider = t.provider_label?.toLowerCase() || "wallet";
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      pendingSales,
      totalWalletsDeposit,
      statusCounts,
      providerCounts,
    };
  }, [orders, transactions]);

  // Order status configuration for visual progress bars
  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Brouillon", color: "bg-slate-400" },
    pending_payment: { label: "Attente Paiement", color: "bg-amber-400" },
    paid: { label: "Payee", color: "bg-sky-400" },
    confirmed: { label: "Confirmee", color: "bg-emerald-400" },
    processing: { label: "Preparation", color: "bg-indigo-400" },
    shipped: { label: "Expediee", color: "bg-orange-400" },
    delivered: { label: "Livree", color: "bg-emerald-600" },
    cancelled: { label: "Annulee", color: "bg-red-500" },
    refunded: { label: "Remboursee", color: "bg-fuchsia-500" },
  };

  const totalOrdersCount = orders.length || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Statistiques
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <BarChart3 className="h-6 w-6 text-[#8b5e34]" /> Tableau de Bord Analytique
          </h1>
          <p className="text-sm text-slate-500">
            Analyse en temps reel des commandes, revenus et transactions de la cooperative.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Metrics summary grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Chiffre d&apos;Affaires (Valide)
                </span>
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatCurrency(metrics.totalSales, "FCFA")}
              </p>
              <p className="mt-1 text-xs text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Commandes livrees/payees
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Commandes en Attente
                </span>
                <ShoppingBag className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatCurrency(metrics.pendingSales, "FCFA")}
              </p>
              <p className="mt-1 text-xs text-slate-400">Paiements non finalises</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Commandes
                </span>
                <ShoppingBag className="h-5 w-5 text-[#8b5e34]" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{orders.length}</p>
              <p className="mt-1 text-xs text-slate-400">Nombre total de paniers valides</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Flux Recharges Wallets
                </span>
                <ArrowDownRight className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatCurrency(metrics.totalWalletsDeposit, "FCFA")}
              </p>
              <p className="mt-1 text-xs text-slate-400">Volume de recharges client</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales & Orders Distribution Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Statuts des Commandes</h3>
              <div className="space-y-4">
                {Object.entries(statusLabels).map(([statusKey, cfg]) => {
                  const count = metrics.statusCounts[statusKey] || 0;
                  const percentage = Math.round((count / totalOrdersCount) * 100);
                  return (
                    <div key={statusKey} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cfg.label}</span>
                        <span className="font-bold text-slate-900">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gateway distribution & Platform Wallet info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Repartitions des Operations de Paiement
                </h3>
                <div className="space-y-4">
                  {Object.entries(metrics.providerCounts).map(([provider, count]) => {
                    const totalTx = transactions.length || 1;
                    const percentage = Math.round((count / totalTx) * 100);
                    return (
                      <div key={provider} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700 uppercase">
                            {provider === "paydunya" ? "Portail PayDunya" : provider}
                          </span>
                          <span className="font-bold text-slate-900">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8b5e34] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Aucune transaction disponible pour l&apos;analyse.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Taux de Conversion Portefeuille</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Les clients preferent recharger leur Wallet via Mobile Money pour commander rapidement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
