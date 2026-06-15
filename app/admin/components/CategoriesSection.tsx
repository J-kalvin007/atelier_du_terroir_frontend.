"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, FolderTree, ImageIcon, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/ecommerce-api";
import { readApiError } from "@/lib/utils";

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  imageFile: File | null;
  imagePreview: string;
}

type CategoryTextField = "name" | "slug" | "description";

const INITIAL_FORM: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  imageFile: null,
  imagePreview: "",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function hasChildren(category: AdminCategory) {
  return Array.isArray(category.children)
    ? category.children.length > 0
    : Boolean(category.children);
}

export default function CategoriesSection() {
  const session = useAuthSession();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(INITIAL_FORM);

  const loadCategories = async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const data = await getAdminCategories(session.token);
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Impossible de charger les categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.token) return;
    void loadCategories();
  }, [session?.token]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(INITIAL_FORM);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageFile: null,
      imagePreview: category.image || "",
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setShowModal(false);
    setEditingCategory(null);
    setForm(INITIAL_FORM);
  };

  const handleChange = (field: CategoryTextField, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !editingCategory ? { slug: slugify(value) } : {}),
    }));
  };

  const handleImageChange = (file: File | null) => {
    setForm((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }

      return {
        ...prev,
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : editingCategory?.image || "",
      };
    });
  };

  const handleSave = async () => {
    if (!session?.token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim(),
        ...(form.imageFile ? { image: form.imageFile } : {}),
      };

      if (editingCategory) {
        await updateAdminCategory(session.token, editingCategory.id, payload);
      } else {
        await createAdminCategory(session.token, payload);
      }

      closeModal();
      await loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(
        readApiError(
          err,
          editingCategory
            ? "Impossible de modifier la categorie."
            : "Impossible de creer la categorie."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.token) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteAdminCategory(session.token, id);
      await loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(readApiError(err, "Impossible de supprimer la categorie."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">{categories.length} categorie(s) enregistree(s)</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Creer une categorie
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
            Chargement des categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            Aucune categorie trouvee.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-primary">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{category.name}</h2>
                    <p className="text-xs text-slate-400">{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-primary"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    {deletingId === category.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-4 min-h-[44px] text-sm leading-6 text-slate-600">
                {category.description || "Aucune description fournie."}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{hasChildren(category) ? "Avec sous-categories" : "Sans sous-categorie"}</span>
                <span>ID: {category.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
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
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCategory ? "Modifier la categorie" : "Nouvelle categorie"}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Nom *</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Image de categorie
                  </label>
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-slate-400">
                      {form.imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.imagePreview}
                          alt={form.name || "Categorie"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-7 w-7" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                      />
                      <p className="mt-2 text-xs text-slate-400">
                        Le backend attend un vrai fichier image en multipart/form-data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.slug.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingCategory ? "Enregistrer" : "Creer"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
