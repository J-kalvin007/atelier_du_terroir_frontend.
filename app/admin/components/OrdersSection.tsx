"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";
import { hasAdminAccess } from "@/lib/auth";
import {
  formatOrderDate,
  formatOrderStatus,
  getAdminOrderByReference,
  getAdminOrders,
  updateAdminOrderStatus,
  type OrderDetail,
  type OrderSummary,
} from "@/lib/ecommerce-api";
import { cn, formatCurrency, getOrderStatusLabel, isPermissionDeniedError, readApiError } from "@/lib/utils";
import { OrderTotalsBreakdown } from "@/components/promotions/OrderTotalsBreakdown";
import { mergeOrderWithPromoMeta } from "@/lib/order-promo-meta";
import { resolveOrderDiscount, formatOrderReductionLabel, getOrderPromoCode, orderHasPromoCode } from "@/lib/promotions";

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value || "—"}</span>
    </div>
  );
}

function mergePromoFieldsFromDetail(summary: OrderSummary, detail: OrderDetail): OrderSummary {
  return mergeOrderWithPromoMeta({
    ...summary,
    notes: detail.notes ?? summary.notes,
    promo_code: detail.promo_code ?? summary.promo_code,
    discount_amount: detail.discount_amount ?? summary.discount_amount,
    total_final: detail.total_final ?? summary.total_final,
    promo_type: detail.promo_type ?? summary.promo_type,
    promo_value: detail.promo_value ?? summary.promo_value,
    reference: summary.reference,
  }) as OrderSummary;
}

async function enrichOrdersWithPromoDetails(token: string, orders: OrderSummary[]) {
  return Promise.all(
    orders.map(async (order) => {
      try {
        const detail = await getAdminOrderByReference(token, order.reference);
        return mergePromoFieldsFromDetail(order, detail);
      } catch {
        return order;
      }
    })
  );
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
  const [viewingOrder, setViewingOrder] = useState<OrderDetail | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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
      setLoading(false);

      void enrichOrdersWithPromoDetails(session.token, data).then(setOrders);
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
      if (viewingOrder?.reference === reference) {
        setViewingOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      await fetchOrders();
    } catch (err) {
      console.error("Erreur mise a jour statut", err);
      setError(readApiError(err, "Erreur lors de la mise a jour du statut."));
    } finally {
      setUpdatingRef(null);
    }
  };

  const openOrderDetail = async (reference: string) => {
    if (!session?.token) return;

    setViewingOrder(null);
    setDetailError(null);
    setViewingLoading(true);

    try {
      const detail = await getAdminOrderByReference(session.token, reference);
      setViewingOrder(detail);
    } catch (err) {
      console.error("Erreur chargement detail commande", err);
      setDetailError(readApiError(err, "Impossible de charger le detail de la commande."));
    } finally {
      setViewingLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setViewingOrder(null);
    setDetailError(null);
  };

  const filtered = orders.filter((order) => {
    if (filter !== "ALL" && normalizeStatus(order.status) !== filter) {
      return false;
    }

    if (!search.trim()) return true;

    const needle = search.trim().toLowerCase();
    return order.reference.toLowerCase().includes(needle);
  });

  const detailConfig = viewingOrder ? getStatusConfig(viewingOrder.status) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
        <p className="text-sm text-slate-500">
          Gestion des commandes clients — cliquez sur l&apos;oeil pour voir le detail.
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
            const discount = resolveOrderDiscount(order);
            const reductionLabel = formatOrderReductionLabel(order, discount);
            const promoCode = getOrderPromoCode(order as Record<string, unknown>);
            const hasPromo = orderHasPromoCode(order as Record<string, unknown>);

            return (
              <motion.div
                key={order.id}
                layout
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  hasPromo
                    ? "border-[#ef8219]/50 border-l-4 border-l-[#ef8219] bg-[#fff8f0] hover:bg-[#fff3e6]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        hasPromo ? "bg-[#ef8219]/15" : "bg-[#fbf5ed]"
                      )}
                    >
                      <config.icon
                        className={cn("h-5 w-5", hasPromo ? "text-[#ef8219]" : "text-[#8b5e34]")}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            hasPromo ? "text-[#c45f0a]" : "text-slate-900"
                          )}
                        >
                          {order.reference}
                        </p>
                        {promoCode ? (
                          <span className="rounded-full border border-[#ef8219]/30 bg-[#ef8219]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#ef8219]">
                            {promoCode}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            config.className
                          )}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className={cn("text-xs", hasPromo ? "text-[#b56a1f]" : "text-slate-500")}>
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="text-right">
                      {discount > 0 ? (
                        <>
                          <p className="text-[11px] font-medium text-[#ef8219]">
                            Reduction {reductionLabel.replace(/^-/, "")} : -{formatCurrency(discount, "FCFA")}
                          </p>
                          <p className={cn("text-base font-bold", hasPromo ? "text-[#ef8219]" : "text-slate-900")}>
                            {formatCurrency(order.total_final, "FCFA")}
                          </p>
                          <p className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(
                              parseFloat(order.items_total) + parseFloat(order.frais_livraison || "0"),
                              "FCFA"
                            )}
                          </p>
                        </>
                      ) : (
                        <span className="text-base font-bold text-slate-900">
                          {formatCurrency(order.total_final, "FCFA")}
                        </span>
                      )}
                    </div>
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
                      onClick={() => void openOrderDetail(order.reference)}
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

      <AnimatePresence>
        {(viewingLoading || viewingOrder || detailError) ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeOrderDetail}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detail de la commande</h3>
                  {viewingOrder ? (
                    <p className="mt-1 font-mono text-sm text-[#8b5e34]">{viewingOrder.reference}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closeOrderDetail}
                  className="text-slate-400 hover:text-slate-900"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {viewingLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Chargement du detail...
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {detailError}
                </div>
              ) : viewingOrder && detailConfig ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                        detailConfig.className
                      )}
                    >
                      <detailConfig.icon className="h-3.5 w-3.5" />
                      {formatOrderStatus(viewingOrder.status)}
                    </span>
                    <select
                      value={viewingOrder.status}
                      disabled={updatingRef === viewingOrder.reference}
                      onChange={(event) =>
                        void handleStatusChange(viewingOrder.reference, event.target.value)
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#8b5e34] disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {getStatusConfig(status).label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Informations
                      </p>
                      <DetailRow label="Reference" value={viewingOrder.reference} />
                      <DetailRow label="Creee le" value={formatOrderDate(viewingOrder.created_at)} />
                      <DetailRow label="Mise a jour" value={formatOrderDate(viewingOrder.updated_at)} />
                      <DetailRow
                        label="Payee le"
                        value={viewingOrder.paid_at ? formatOrderDate(viewingOrder.paid_at) : "Non payee"}
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Livraison
                      </p>
                      <DetailRow label="Adresse" value={viewingOrder.address_livraison} />
                      <DetailRow label="Ville" value={viewingOrder.city} />
                      <DetailRow label="Pays" value={viewingOrder.country} />
                      <DetailRow
                        label="Telephone"
                        value={viewingOrder.phone_livraison}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Package className="h-4 w-4 text-[#8b5e34]" />
                        Articles ({viewingOrder.items?.length ?? 0})
                      </p>
                    </div>
                    {(viewingOrder.items?.length ?? 0) === 0 ? (
                      <p className="px-4 py-6 text-sm text-slate-500">Aucun article dans cette commande.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-2.5 font-semibold">Produit</th>
                              <th className="px-4 py-2.5 font-semibold">SKU</th>
                              <th className="px-4 py-2.5 font-semibold">Qté</th>
                              <th className="px-4 py-2.5 font-semibold">Prix unit.</th>
                              <th className="px-4 py-2.5 font-semibold">Sous-total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingOrder.items.map((item) => (
                              <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-medium text-slate-900">
                                  {item.product_name || "Produit"}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                  {item.product_sku || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                                <td className="px-4 py-3 text-slate-700">
                                  {formatCurrency(item.unit_price, "FCFA")}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                  {formatCurrency(item.subtotal, "FCFA")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#eadfce] bg-[#fbf5ed] p-4">
                    <OrderTotalsBreakdown order={viewingOrder} variant="admin" embedded />
                  </div>

                  {viewingOrder.notes?.trim() ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Notes client
                      </p>
                      <p className="text-sm text-slate-700">{viewingOrder.notes}</p>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    Contact livraison : {viewingOrder.phone_livraison || "—"}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
