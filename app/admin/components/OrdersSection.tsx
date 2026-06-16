"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  ShoppingCart,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";
import { hasAdminAccess } from "@/lib/auth";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type OrderSummary,
} from "@/lib/ecommerce-api";
import { cn, formatCurrency, getOrderStatusLabel, isPermissionDeniedError, readApiError } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: "Brouillon", className: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  pending_payment: { label: "Paiement en attente", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  paid: { label: "Payee", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  confirmed: { label: "Confirmee", className: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  processing: { label: "Preparation", className: "bg-orange-50 text-orange-700 border-orange-200", icon: ShoppingCart },
  shipped: { label: "Expediee", className: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Truck },
  delivered: { label: "Livree", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Annulee", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  refunded: { label: "Remboursee", className: "bg-purple-50 text-purple-700 border-purple-200", icon: XCircle },
};

const STATUS_OPTIONS = [
  "draft",
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

function normalizeStatus(status: string) {
  return status.toLowerCase();
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[normalizeStatus(status)] ?? STATUS_CONFIG.draft;
}

export default function OrdersSection() {
  const session = useAuthSession();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session?.token) return;

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    if (!hasAdminAccess(session)) {
      setOrders([]);
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    try {
      const data = await getAdminOrders(session.token);
      setOrders(data);
    } catch (err) {
      console.warn("Erreur fetch orders", err);
      if (isPermissionDeniedError(err)) {
        setPermissionDenied(true);
        setError(
          readApiError(
            err,
            "Acces refuse : role platform_admin requis pour voir toutes les commandes."
          )
        );
      } else {
        setError(readApiError(err, "Impossible de charger les commandes."));
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, [session?.token]);

  const handleStatusChange = async (reference: string, newStatus: string) => {
    if (!session) return;

    setUpdatingRef(reference);
    try {
      await updateAdminOrderStatus(session.token, reference, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error("Erreur mise a jour statut", err);
      setError(readApiError(err, "Erreur lors de la mise a jour du statut."));
    } finally {
      setUpdatingRef(null);
    }
  };

  const filtered = orders.filter((order) => {
    if (filter !== "ALL" && normalizeStatus(order.status) !== filter) {
      return false;
    }

    if (!search.trim()) return true;

    const needle = search.trim().toLowerCase();
    return order.reference.toLowerCase().includes(needle);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
        <p className="text-sm text-slate-500">
          Liste depuis `/api/v1/commandes/admin/all-commandes/` (role platform_admin requis)
        </p>
      </div>

      {permissionDenied ? (
        <AdminAccessNotice
          title="Droits admin insuffisants pour les commandes"
          description="Endpoint /api/v1/commandes/admin/all-commandes/ — role platform_admin requis."
        />
      ) : null}

      {error && !permissionDenied ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: "ALL", label: "Toutes", count: orders.length },
          ...STATUS_OPTIONS.map((key) => ({
            key,
            label: getStatusConfig(key).label,
            count: orders.filter((order) => normalizeStatus(order.status) === key).length,
          })),
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              filter === item.key
                ? "border border-[#d4c0a7] bg-[#fbf5ed] text-[#8b5e34]"
                : "border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {item.label}
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px]">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher par reference..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#8b5e34]"
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
            Chargement des commandes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            Aucune commande disponible.
          </div>
        ) : (
          filtered.map((order) => {
            const config = getStatusConfig(order.status);
            return (
              <motion.div
                key={order.id}
                layout
                className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf5ed]">
                      <config.icon className="h-5 w-5 text-[#8b5e34]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{order.reference}</p>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            config.className
                          )}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(order.total_final, "FCFA")}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingRef === order.reference}
                      onChange={(event) => void handleStatusChange(order.reference, event.target.value)}
                      className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {getStatusConfig(status).label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#8b5e34]"
                      aria-label={`Voir ${order.reference}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
