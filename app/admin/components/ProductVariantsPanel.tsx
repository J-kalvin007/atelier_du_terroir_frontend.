"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  createAdminProductVariant,
  deleteAdminProductVariant,
  patchAdminProductVariant,
  updateAdminProductVariant,
  type AdminProductVariant,
  type AdminProductVariantPayload,
} from "@/lib/ecommerce-api";
import { cn, formatCurrency, readApiError, sanitizeDecimalPrice } from "@/lib/utils";

interface VariantFormState {
  name: string;
  sku: string;
  price: string;
  stock: string;
  weight_grams: string;
  is_active: boolean;
}

const INITIAL_VARIANT_FORM: VariantFormState = {
  name: "",
  sku: "",
  price: "",
  stock: "0",
  weight_grams: "",
  is_active: true,
};

interface ProductVariantsPanelProps {
  productId: string;
  token: string;
  variants: AdminProductVariant[];
  onVariantsChange: (variants: AdminProductVariant[]) => void;
  onNotice?: (message: string) => void;
  onError?: (message: string) => void;
}

function buildVariantPayload(
  productId: string,
  form: VariantFormState
): AdminProductVariantPayload {
  const weightRaw = form.weight_grams.trim();

  return {
    product: productId,
    name: form.name.trim().slice(0, 100),
    sku: form.sku.trim() || null,
    price: sanitizeDecimalPrice(form.price),
    stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
    weight_grams: weightRaw ? Math.max(0, Math.floor(Number(weightRaw))) : null,
    is_active: form.is_active,
  };
}

export default function ProductVariantsPanel({
  productId,
  token,
  variants,
  onVariantsChange,
  onNotice,
  onError,
}: ProductVariantsPanelProps) {
  const [form, setForm] = useState<VariantFormState>(INITIAL_VARIANT_FORM);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const productVariants = useMemo(
    () => variants.filter((variant) => variant.product === productId),
    [productId, variants]
  );

  const resetForm = () => {
    setForm(INITIAL_VARIANT_FORM);
    setEditingVariantId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setForm(INITIAL_VARIANT_FORM);
    setEditingVariantId(null);
    setShowForm(true);
  };

  const openEditForm = (variant: AdminProductVariant) => {
    setEditingVariantId(variant.id);
    setForm({
      name: variant.name || "",
      sku: variant.sku || "",
      price: variant.price || "",
      stock: String(variant.stock ?? 0),
      weight_grams: variant.weight_grams != null ? String(variant.weight_grams) : "",
      is_active: variant.is_active ?? true,
    });
    setShowForm(true);
  };

  const upsertVariant = (nextVariant: AdminProductVariant) => {
    onVariantsChange([
      nextVariant,
      ...variants.filter((variant) => variant.id !== nextVariant.id),
    ]);
  };

  const removeVariant = (id: string) => {
    onVariantsChange(variants.filter((variant) => variant.id !== id));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      onError?.("name* et price* sont obligatoires pour une variante.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildVariantPayload(productId, form);
      const savedVariant = editingVariantId
        ? await updateAdminProductVariant(token, editingVariantId, payload)
        : await createAdminProductVariant(token, payload);

      upsertVariant({ ...savedVariant, product: productId });
      onNotice?.(editingVariantId ? "Variante mise à jour." : "Variante créée.");
      resetForm();
    } catch (error) {
      console.error("Error saving product variant:", error);
      onError?.(readApiError(error, "Impossible d'enregistrer la variante."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (variant: AdminProductVariant) => {
    try {
      const savedVariant = await patchAdminProductVariant(token, variant.id, {
        is_active: !(variant.is_active ?? true),
      });
      upsertVariant({ ...savedVariant, product: productId });
    } catch (error) {
      console.error("Error toggling variant:", error);
      onError?.(readApiError(error, "Impossible de modifier le statut de la variante."));
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminProductVariant(token, id);
      removeVariant(id);
      if (editingVariantId === id) {
        resetForm();
      }
      onNotice?.("Variante supprimée.");
    } catch (error) {
      console.error("Error deleting variant:", error);
      onError?.(readApiError(error, "Impossible de supprimer la variante."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Variantes produit</p>
          <p className="text-xs text-slate-500">
            product*, name*, price*, sku, stock, weight_grams, is_active
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </button>
      </div>

      {productVariants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
          Aucune variante pour ce produit.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Nom", "SKU", "Prix", "Stock", "Poids (g)", "Actif", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productVariants.map((variant) => (
                <tr key={variant.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2 text-xs font-medium text-slate-900">{variant.name}</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-slate-500">
                    {variant.sku || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-slate-900">
                    {formatCurrency(parseFloat(variant.price), "FCFA")}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{variant.stock ?? 0}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {variant.weight_grams ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(variant)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        variant.is_active ?? true
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {variant.is_active ?? true ? "Oui" : "Non"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(variant)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-orange-50 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(variant.id)}
                        disabled={deletingId === variant.id}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === variant.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {editingVariantId ? "Modifier la variante" : "Nouvelle variante"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">name*</label>
              <input
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">sku</label>
              <input
                value={form.sku}
                maxLength={100}
                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">price*</label>
              <input
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">stock</label>
              <input
                value={form.stock}
                type="number"
                min={0}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                weight_grams
              </label>
              <input
                value={form.weight_grams}
                type="number"
                min={0}
                onChange={(e) => setForm((prev) => ({ ...prev, weight_grams: e.target.value }))}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end">
              <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                is_active
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !form.name.trim() || !form.price.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Enregistrer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
