"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tag, Zap, Plus, Percent, Clock, Loader2, X, Save } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  createAdminPromoCode,
  getAdminFlashSales,
  getAdminPromoCodes,
  type AdminFlashSale,
  type AdminPromoCode,
} from "@/lib/ecommerce-api";
import { cn, formatCurrency, readApiError } from "@/lib/utils";

interface PromoFormState {
  code: string;
  description: string;
  type: "percentage" | "fixed_amount";
  value: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const INITIAL_FORM: PromoFormState = {
  code: "",
  description: "",
  type: "percentage",
  value: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

export default function PromotionsSection() {
  const session = useAuthSession();
  const [tab, setTab] = useState<"coupons" | "flash">("coupons");
  const [showModal, setShowModal] = useState(false);
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [flashSales, setFlashSales] = useState<AdminFlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PromoFormState>(INITIAL_FORM);

  const loadData = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const [promoData, flashData] = await Promise.all([
        getAdminPromoCodes(session.token),
        getAdminFlashSales(session.token),
      ]);
      setPromos(promoData);
      setFlashSales(flashData);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError(readApiError(err, "Impossible de charger les promotions."));
      setPromos([]);
      setFlashSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [session?.token]);

  const stats = useMemo(
    () => ({
      activePromos: promos.filter((promo) => promo.is_active).length,
      totalUses: promos.reduce((total, promo) => total + (promo.number_times_used ?? 0), 0),
      activeFlash: flashSales.filter((flash) => flash.is_active).length,
    }),
    [flashSales, promos]
  );

  const closeModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
  };

  const handleSavePromo = async () => {
    if (!session) return;

    setSaving(true);
    setError(null);

    try {
      await createAdminPromoCode(session.token, {
        is_active: form.is_active,
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        type: form.type,
        value: form.value.trim(),
        starts_at: form.starts_at || undefined,
        expires_at: form.expires_at || null,
      });
      closeModal();
      await loadData();
    } catch (err) {
      console.error("Error creating promo:", err);
      setError(readApiError(err, "Impossible de creer le code promo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500">Codes promo et ventes flash admin</p>
        </div>
        {tab === "coupons" ? (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Nouveau code
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Codes actifs", value: stats.activePromos, icon: Tag },
          { label: "Utilisations", value: stats.totalUses, icon: Percent },
          { label: "Flash actives", value: stats.activeFlash, icon: Zap },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <stat.icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[
          { key: "coupons" as const, label: "Codes promo" },
          { key: "flash" as const, label: "Ventes flash" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === item.key
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
          Chargement...
        </div>
      ) : tab === "coupons" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {promos.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucun code promo.
            </div>
          ) : (
            promos.map((promo) => (
              <div key={promo.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-slate-900">{promo.code}</p>
                    <p className="mt-1 text-sm text-slate-500">{promo.description || "Sans description"}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      promo.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {promo.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>
                    {promo.type === "percentage" ? `${promo.value}%` : formatCurrency(promo.value, "FCFA")}
                  </span>
                  <span>{promo.number_times_used ?? 0} utilisation(s)</span>
                  {promo.expires_at ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(promo.expires_at).toLocaleDateString("fr-FR")}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {flashSales.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune vente flash.
            </div>
          ) : (
            flashSales.map((flash) => (
              <div key={flash.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Produit {flash.product.slice(0, 8)}...</p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      flash.is_active ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {flash.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(flash.sale_price, "FCFA")}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(flash.original_price, "FCFA")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {flash.product_sold_count}/{flash.quota_stock_limit} vendus
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Nouveau code promo</h3>
                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={form.code}
                  onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                  placeholder="CODE PROMO"
                  className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-primary"
                />
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Description"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        type: event.target.value as PromoFormState["type"],
                      }))
                    }
                    className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed_amount">Montant fixe</option>
                  </select>
                  <input
                    value={form.value}
                    onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                    placeholder="Valeur"
                    className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleSavePromo()}
                  disabled={saving || !form.code.trim() || !form.value.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Creer
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
