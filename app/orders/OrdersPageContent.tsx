"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Package } from "lucide-react";
import { ClientAccountShell } from "@/components/dashboard/ClientAccountShell";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  formatOrderDate,
  formatOrderStatus,
  getOrderByReference,
  getOrders,
  type OrderDetail,
  type OrderSummary,
} from "@/lib/ecommerce-api";
import { formatCurrency, readApiError } from "@/lib/utils";
import { OrderDetailLoadingPanel, OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { resolveOrderDiscount } from "@/lib/promotions";

function mergeOrders(primary: OrderSummary[], secondary: OrderSummary[]) {
  const merged = new Map<string, OrderSummary>();

  for (const order of [...secondary, ...primary]) {
    merged.set(order.reference, order);
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export default function OrdersPageContent() {
  const session = useAuthSession();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailReference, setDetailReference] = useState<string | null>(reference);
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!session?.token) {
      setOrders([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await getOrders(session.token);
      let nextOrders = list;

      if (reference) {
        try {
          const highlightedOrder = await getOrderByReference(session.token, reference);
          nextOrders = mergeOrders(list, [highlightedOrder]);
        } catch {
          nextOrders = list;
        }
      }

      setOrders(nextOrders);
    } catch (err) {
      if (reference) {
        try {
          const highlightedOrder = await getOrderByReference(session.token, reference);
          setOrders([highlightedOrder]);
          setError(null);
          return;
        } catch {
          // Fall through to generic error.
        }
      }

      setOrders([]);
      setError(readApiError(err, "Impossible de charger vos commandes."));
    } finally {
      setLoading(false);
    }
  }, [reference, session?.token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!session?.token || !detailReference) {
      setDetailOrder(null);
      return;
    }

    let active = true;
    setDetailLoading(true);

    void (async () => {
      try {
        const order = await getOrderByReference(session.token!, detailReference);
        if (active) {
          setDetailOrder(order);
        }
      } catch {
        if (active) {
          setDetailOrder(null);
        }
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [detailReference, session?.token]);

  function openOrderDetail(orderReference: string) {
    setDetailReference(orderReference);
  }

  function closeOrderDetail() {
    setDetailReference(null);
    setDetailOrder(null);
  }

  return (
    <ClientAccountShell>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Package className="h-7 w-7 text-[#ef8219]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1f241c]">Mes commandes</h1>
            <p className="text-sm text-[#5c6a59]">Historique de vos achats.</p>
          </div>
        </div>

        {reference || checkoutSuccess ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {reference
              ? `Commande confirmee : ${reference}.`
              : "Commande confirmee avec succes."}
          </div>
        ) : null}

        {!session?.token ? (
          <AuthPrompt />
        ) : loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => void loadOrders()} />
        ) : orders.length === 0 ? (
          <EmptyBlock message="Aucune commande pour le moment." />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const discount = resolveOrderDiscount(order);

              return (
                <button
                  key={order.reference}
                  type="button"
                  onClick={() => openOrderDetail(order.reference)}
                  className="w-full rounded-2xl border border-[#eadcca] bg-white p-5 text-left shadow-sm transition hover:border-[#ef8219]/40 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#1f241c]">{order.reference}</p>
                      <p className="mt-1 text-xs text-[#5c6a59]">{formatOrderDate(order.created_at)}</p>
                    </div>
                    <span className="rounded-full bg-[#eef6ea] px-3 py-1 text-xs font-semibold text-[#1f4d3f]">
                      {formatOrderStatus(order.status)}
                    </span>
                    <p className="text-sm font-bold text-[#ef8219]">
                      {formatCurrency(parseFloat(order.total_final || order.items_total), "FCFA")}
                      {discount > 0 ? (
                        <span className="ml-2 text-xs font-medium text-emerald-700">
                          (reduction appliquee)
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#8b5e34]">Voir le detail</p>
                </button>
              );
            })}
          </div>
        )}

        {detailLoading ? <OrderDetailLoadingPanel onClose={closeOrderDetail} /> : null}
        {detailOrder && !detailLoading ? (
          <OrderDetailPanel order={detailOrder} onClose={closeOrderDetail} variant="client" />
        ) : null}
      </div>
    </ClientAccountShell>
  );
}

function AuthPrompt() {
  return (
    <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
      <p className="text-sm text-[#5c6a59]">Connectez-vous pour voir vos commandes.</p>
      <Link
        href="/login?redirect=/orders"
        className="mt-4 inline-flex rounded-full bg-[#ef8219] px-5 py-2 text-sm font-semibold text-white"
      >
        Connexion
      </Link>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex justify-center py-16 text-[#8b5e34]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#eadcca] bg-white p-10 text-center">
      <p className="text-sm text-[#5c6a59]">{message}</p>
      <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-[#ef8219] hover:underline">
        Continuer mes achats
      </Link>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <p className="text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex rounded-full bg-[#ef8219] px-5 py-2 text-sm font-semibold text-white"
      >
        Reessayer
      </button>
    </div>
  );
}
