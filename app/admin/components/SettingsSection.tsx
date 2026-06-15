"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle, HelpCircle, Loader2 } from "lucide-react";

type StoreSettings = {
  storeName: string;
  contactEmail: string;
  currency: string;
  defaultShippingRate: string;
  fidelityRatio: string;
  maintenanceMode: boolean;
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "L'Atelier du Terroir",
  contactEmail: "admin@atelier-terroir.sn",
  currency: "FCFA",
  defaultShippingRate: "2000",
  fidelityRatio: "10", // 1 point = 10 FCFA
  maintenanceMode: false,
};

export default function SettingsSection() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("atelier_admin_settings");
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (e) {
          console.error("Error loading settings:", e);
        }
      }
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("atelier_admin_settings", JSON.stringify(settings));
      }
      setSaving(false);
      setSuccess(true);
    }, 400);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
          Configuration
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Settings className="h-6 w-6 text-[#8b5e34]" /> Parametres de la Plateforme
        </h1>
        <p className="text-sm text-slate-500">
          Gere le fonctionnement general du catalogue, des frais de port et du cashback fideliation.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-2 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Parametres sauvegardes avec succes!</p>
            <p className="text-xs mt-1">Les modifications locales ont ete appliquees sur le navigateur.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Nom de la boutique *
            </label>
            <input
              required
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Email de contact admin *
            </label>
            <input
              required
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Devise *</label>
            <input
              required
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 outline-none"
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Frais de livraison par defaut (FCFA) *
            </label>
            <input
              required
              type="number"
              value={settings.defaultShippingRate}
              onChange={(e) => setSettings((s) => ({ ...s, defaultShippingRate: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Regles Fideliation & Cashback</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              Valeur d&apos;un point (FCFA) *
              <span className="group relative">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden w-48 rounded bg-slate-900 p-2 text-[10px] text-white group-hover:block">
                  1 point de fidelite depense reduira la commande de X FCFA.
                </span>
              </span>
            </label>
            <input
              required
              type="number"
              value={settings.fidelityRatio}
              onChange={(e) => setSettings((s) => ({ ...s, fidelityRatio: e.target.value }))}
              className="h-10 w-48 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#8b5e34]"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-[#8b5e34] focus:ring-[#8b5e34]"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">Mode maintenance actif</p>
              <p className="text-xs text-slate-500">
                Affiche une page d&apos;attente pour les clients de la cooperative.
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5e34] py-3 text-sm font-semibold text-white transition-all hover:bg-[#744b27] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer les Parametres
        </button>
      </form>
    </div>
  );
}
