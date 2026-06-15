"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { getAdminAllTransactions, getAdminOrders, type OrderSummary, type AdminTransaction } from "@/lib/ecommerce-api";

type RealAuditLog = {
  id: string;
  type: "transaction" | "order";
  action: string;
  resource: string;
  description: string;
  date: string;
};

export default function AuditSection() {
  const session = useAuthSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    if (!session?.token) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersData, transactionsData] = await Promise.all([
        getAdminOrders(session.token),
        getAdminAllTransactions(session.token),
      ]);
      setOrders(ordersData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError("Impossible de charger les journaux d'audit reels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  // Compile real logs from API endpoints
  const auditLogs = useMemo(() => {
    const list: RealAuditLog[] = [];

    // Add orders
    orders.forEach((order) => {
      list.push({
        id: order.id,
        type: "order",
        action: `COMMANDE_${order.status.toUpperCase()}`,
        resource: `Commande #${order.reference}`,
        description: `Montant total: ${order.total_final} FCFA (Frais livr: ${order.frais_livraison} FCFA)`,
        date: order.created_at,
      });
    });

    // Add transactions
    transactions.forEach((tx) => {
      list.push({
        id: tx.id,
        type: "transaction",
        action: `TRANSACTION_${tx.type_label?.toUpperCase().replace(/\s+/g, "_") || "FINANCIERE"}`,
        resource: tx.provider_label || "Wallet",
        description: `Flux de ${tx.amount} FCFA - Statut: ${tx.status_label || "Valide"} - Ref Externe: ${tx.reference_externe || "N/A"}`,
        date: tx.created_at,
      });
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, transactions]);

  // Search filter
  const filteredLogs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return auditLogs;

    return auditLogs.filter((log) => {
      return (
        log.action.toLowerCase().includes(needle) ||
        log.resource.toLowerCase().includes(needle) ||
        log.description.toLowerCase().includes(needle)
      );
    });
  }, [auditLogs, search]);

  const getActionColor = (action: string) => {
    if (action.includes("TRANSACTION_RECHARGE") || action.includes("DEPOSIT")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("COMMANDE_LIVREE") || action.includes("DELIVERED") || action.includes("PAID") || action.includes("PAYEE")) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (action.includes("RETRAIT") || action.includes("WITHDRAW") || action.includes("NEGATIVE") || action.startsWith("TRANSACTION_RETRAIT")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (action.includes("ANNULEE") || action.includes("CANCELLED") || action.includes("FAILED")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
            Securite & Tracabilite
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-[#8b5e34]" /> Journal d&apos;Audit API
          </h1>
          <p className="text-sm text-slate-500">
            Evenements en temps reel compiles depuis l&apos;historique des commandes et transferts financiers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher par action, ressource, details..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#8b5e34]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Ressource</th>
                  <th className="px-6 py-3">Details de l&apos;evenement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune activite trouvee.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {log.date ? new Date(log.date).toLocaleString("fr-FR") : "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold capitalize text-slate-900">
                        {log.type}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
