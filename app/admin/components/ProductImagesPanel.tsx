"use client";

import { useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useConfirmDialog } from "@/components/admin/useConfirmDialog";
import {
  deleteAdminProductImage,
  patchAdminProductImage,
  type AdminProductImage,
} from "@/lib/ecommerce-api";
import { cn, readApiError, resolveMediaUrl } from "@/lib/utils";

interface ProductImagesPanelProps {
  productId: string;
  token: string;
  images: AdminProductImage[];
  onImagesChange: (images: AdminProductImage[]) => void;
  onNotice?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function ProductImagesPanel({
  productId,
  token,
  images,
  onImagesChange,
  onNotice,
  onError,
}: ProductImagesPanelProps) {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { alt_text: string; is_active: boolean }>>(
    {}
  );

  const getDraft = (image: AdminProductImage) =>
    drafts[image.id] ?? {
      alt_text: image.alt_text || "",
      is_active: image.is_active ?? true,
    };

  const updateDraft = (
    imageId: string,
    patch: Partial<{ alt_text: string; is_active: boolean }>
  ) => {
    const image = images.find((item) => item.id === imageId);
    if (!image) return;

    setDrafts((prev) => ({
      ...prev,
      [imageId]: {
        ...getDraft(image),
        ...patch,
      },
    }));
  };

  const replaceImage = (nextImage: AdminProductImage) => {
    onImagesChange(images.map((image) => (image.id === nextImage.id ? nextImage : image)));
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((image) => image.id !== id));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSave = async (image: AdminProductImage) => {
    const draft = getDraft(image);
    setSavingId(image.id);

    try {
      const savedImage = await patchAdminProductImage(token, image.id, {
        alt_text: draft.alt_text.slice(0, 255),
        is_active: draft.is_active,
      });
      replaceImage({ ...savedImage, product: productId });
      onNotice?.("Image mise à jour.");
    } catch (error) {
      console.error("Error updating product image:", error);
      onError?.(readApiError(error, "Impossible de mettre à jour l'image."));
    } finally {
      setSavingId(null);
    }
  };

  const handleSetPrimary = async (image: AdminProductImage) => {
    setSavingId(image.id);

    try {
      const savedImage = await patchAdminProductImage(token, image.id, {
        is_primary: true,
      });

      onImagesChange(
        images.map((item) =>
          item.id === savedImage.id
            ? { ...savedImage, product: productId, is_primary: true }
            : { ...item, is_primary: false }
        )
      );
      onNotice?.("Image principale définie.");
    } catch (error) {
      console.error("Error setting primary image:", error);
      onError?.(readApiError(error, "Impossible de définir l'image principale."));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Supprimer l'image",
      description:
        "Supprimer définitivement cette image ? Elle sera retirée du produit et de la bibliothèque.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);

    try {
      await deleteAdminProductImage(token, id);
      removeImage(id);
      onNotice?.("Image supprimée définitivement.");
    } catch (error) {
      console.error("Error deleting product image:", error);
      onError?.(readApiError(error, "Impossible de supprimer l'image."));
    } finally {
      setDeletingId(null);
    }
  };

  if (images.length === 0) {
    return (
      <>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">
          Aucune image enregistrée pour ce produit. Téléversez une image ou liez-en une depuis la
          bibliothèque.
        </div>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
      {images.map((image, index) => {
        const draft = getDraft(image);
        const isBusy = savingId === image.id;

        return (
          <div
            key={image.id}
            className={cn(
              "rounded-2xl border bg-white p-3",
              image.is_primary ? "border-primary/40 ring-1 ring-primary/20" : "border-slate-200"
            )}
          >
            <div className="flex gap-3">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(image.image) || image.image}
                  alt={draft.alt_text || `Image ${index + 1}`}
                  className="max-h-full max-w-full object-contain p-1"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {image.is_primary ? (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Image principale
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleSetPrimary(image)}
                      className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-primary/40 hover:text-primary disabled:opacity-50"
                    >
                      <Star className="h-3 w-3" />
                      Définir principale
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400">id: {image.id.slice(0, 8)}…</span>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    alt_text (max 255)
                  </label>
                  <input
                    value={draft.alt_text}
                    maxLength={255}
                    onChange={(e) => updateDraft(image.id, { alt_text: e.target.value })}
                    className="h-8 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={draft.is_active}
                      onChange={(e) => updateDraft(image.id, { is_active: e.target.checked })}
                    />
                    is_active
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleSave(image)}
                      className="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === image.id}
                      onClick={() => void handleDelete(image.id)}
                      className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title="Supprimer définitivement"
                    >
                      {deletingId === image.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
      {confirmDialog}
    </>
  );
}
