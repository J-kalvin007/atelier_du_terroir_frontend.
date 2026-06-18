"use client";

import { Loader2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderTotalsBreakdown } from "@/components/promotions/OrderTotalsBreakdown";
import type { OrderDetail } from "@/lib/ecommerce-api";

type OrderDetailPanelProps = {
  order: OrderDetail;
  onClose: () => void;
  variant?: "client" | "admin";
};

export function OrderDetailPanel({ order, onClose, variant = "client" }: OrderDetailPanelProps) {
  const isAdmin = variant === "admin";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
          isAdmin ? "border-slate-200 bg-white" : "border-[#eadcca] bg-white"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1f241c]">Detail de la commande</h3>
            <p className="mt-1 font-mono text-sm text-[#8b5e34]">{order.reference}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a9086] hover:text-[#1f241c]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#eadcca] bg-white">
            <div className="border-b border-[#eadcca] px-4 py-3">
              <p className="text-sm font-semibold text-[#1f241c]">
                Articles ({order.items?.length ?? 0})
              </p>
            </div>
            {(order.items?.length ?? 0) === 0 ? (
              <p className="px-4 py-6 text-sm text-[#5c6a59]">Aucun article.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#fbf5ed] text-xs uppercase tracking-wide text-[#8b5e34]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Produit</th>
                      <th className="px-4 py-2.5 font-semibold">Qte</th>
                      <th className="px-4 py-2.5 font-semibold">Prix unit.</th>
                      <th className="px-4 py-2.5 font-semibold">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-[#f3ede2]">
                        <td className="px-4 py-3 font-medium text-[#1f241c]">
                          {item.product_name || "Produit"}
                        </td>
                        <td className="px-4 py-3 text-[#5c6a59]">{item.quantity}</td>
                        <td className="px-4 py-3 text-[#5c6a59]">
                          {formatCurrency(item.unit_price, "FCFA")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1f241c]">
                          {formatCurrency(item.subtotal, "FCFA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <OrderTotalsBreakdown order={order} variant={variant} />
        </div>
      </div>
    </>
  );
}

export function OrderDetailLoadingPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#eadcca] bg-white p-10 shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b5e34]" />
      </div>
    </>
  );
}
