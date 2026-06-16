"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Edit3,
  Eye,
  Filter,
  Loader2,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { cn, formatCurrency, readApiError, sanitizeApiSlug, sanitizeDecimalPrice } from "@/lib/utils";
import {
  type AdminCatalogProductPayload,
  type ProductTypeEnum,
  createAdminProduct,
  createAdminProductImage,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProductImages,
  getAdminProducts,
  getAdminProductVariants,
  getPublicCategories,
  updateAdminProduct,
  type AdminCategory,
  type AdminCatalogProduct,
  type AdminProductImage,
  type AdminProductVariant,
} from "@/lib/ecommerce-api";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  status: string;
  categoryName: string;
  image: string;
  productType: string;
  variantsCount: number;
  isTop: boolean;
}

interface ProductFormState {
  name: string;
  slug: string;
  sku: string;
  description: string;
  product_type: ProductTypeEnum;
  price: string;
  stock: string;
  weight_grams: string;
  seo_title: string;
  seo_description: string;
  is_top: boolean;
  alt_text: string;
}

interface UploadedProductImage {
  id: string;
  file: File;
  preview: string;
  alt_text: string;
}

interface ProductFormErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
  category?: string;
  product_type?: string;
}

const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductTypeEnum; label: string }> = [
  { value: "RAW", label: "RAW — Brut" },
  { value: "PROCESSED", label: "PROCESSED — Transforme" },
  { value: "EXPORT", label: "EXPORT — Export" },
];

const INITIAL_FORM: ProductFormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  product_type: "RAW",
  price: "",
  stock: "0",
  weight_grams: "",
  seo_title: "",
  seo_description: "",
  is_top: false,
  alt_text: "",
};

const STOCK_BADGE: Record<string, { label: string; className: string }> = {
  IN_STOCK: { label: "En stock", className: "bg-emerald-50 text-emerald-700" },
  LOW_STOCK: { label: "Stock faible", className: "bg-amber-50 text-amber-700" },
  OUT_OF_STOCK: { label: "Rupture", className: "bg-red-50 text-red-700" },
};

function slugify(value: string) {
  return sanitizeApiSlug(value);
}

function makeSku(value: string) {
  const base = sanitizeApiSlug(value).toUpperCase().replace(/-/g, "_");
  return (base || "PRODUIT").slice(0, 100);
}

function validateProductForm(
  form: ProductFormState,
  selectedCategoryId: string
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!form.name.trim()) errors.name = "name* est obligatoire (max 255).";
  if (!form.sku.trim()) errors.sku = "sku* est obligatoire (max 100).";
  if (!form.price.trim()) errors.price = "price* est obligatoire (decimal).";
  if (form.stock.trim() && Number.isNaN(Number(form.stock))) {
    errors.stock = "stock doit etre un entier >= 0.";
  }
  if (!selectedCategoryId) errors.category = "category* (UUID) est obligatoire.";
  if (!PRODUCT_TYPE_OPTIONS.some((option) => option.value === form.product_type)) {
    errors.product_type = "product_type* doit etre RAW, PROCESSED ou EXPORT.";
  }

  return errors;
}

function buildProductPayload(
  form: ProductFormState,
  selectedCategoryId: string,
  relatedProductIds: string[]
): AdminCatalogProductPayload {
  const weightRaw = form.weight_grams.trim();

  return {
    category: selectedCategoryId,
    name: form.name.trim().slice(0, 255),
    slug: form.slug.trim() ? sanitizeApiSlug(form.slug, form.name) : sanitizeApiSlug(form.name),
    sku: form.sku.trim().slice(0, 100),
    description: form.description.trim() || null,
    product_type: form.product_type,
    price: sanitizeDecimalPrice(form.price),
    stock: form.stock.trim() ? Number(form.stock) : 0,
    weight_grams: weightRaw ? Number(weightRaw) : null,
    seo_title: form.seo_title.trim().slice(0, 255) || null,
    seo_description: form.seo_description.trim() || null,
    is_top: form.is_top,
    related_products: relatedProductIds,
  };
}

function mapProduct(product: AdminCatalogProduct): ProductRow {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    stock: product.stock ?? 0,
    status:
      typeof product.is_in_stock === "string"
        ? product.is_in_stock
        : (product.stock ?? 0) > 0
          ? "IN_STOCK"
          : "OUT_OF_STOCK",
    categoryName:
      typeof product.category === "object" ? product.category?.name || "" : String(product.category || ""),
    image:
      product.images?.find((image) => image.is_primary)?.image ||
      product.images?.[0]?.image ||
      product.primary_image ||
      product.image ||
      product.image_url ||
      product.thumbnail ||
      "",
    productType: product.product_type || "RAW",
    variantsCount: product.variants?.length || 0,
    isTop: Boolean(product.is_top),
  };
}

export default function ProductsSection() {
  const session = useAuthSession();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [products, setProducts] = useState<AdminCatalogProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [productImages, setProductImages] = useState<AdminProductImage[]>([]);
  const [productVariants, setProductVariants] = useState<AdminProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedProductImage[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const rows = useMemo(() => products.map(mapProduct), [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((product) =>
      [product.name, product.sku, product.categoryName, product.productType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [rows, search]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      inStock: rows.filter((product) => product.status === "IN_STOCK").length,
      lowStock: rows.filter((product) => product.status === "LOW_STOCK").length,
      variants: productVariants.length,
    }),
    [rows, productVariants]
  );

  const selectedLibraryImage = productImages.find((image) => image.id === selectedImageId);
  const editingProduct = editingProductId
    ? products.find((product) => product.id === editingProductId) ?? null
    : null;
  const existingProductImages = editingProduct?.images ?? [];
  const currentUploadedImage = uploadedImages[previewImageIndex];
  const currentExistingImage =
    uploadedImages.length === 0 && !selectedLibraryImage
      ? existingProductImages[previewImageIndex] ?? existingProductImages[0]
      : null;
  const currentPreviewImage =
    currentUploadedImage?.preview || selectedLibraryImage?.image || currentExistingImage?.image || "";
  const currentPreviewAlt =
    currentUploadedImage?.alt_text ||
    selectedLibraryImage?.alt_text ||
    currentExistingImage?.alt_text ||
    form.alt_text ||
    form.name ||
    "Prévisualisation";

  const upsertProduct = (nextProduct: AdminCatalogProduct) => {
    setProducts((prev) => {
      const existingIndex = prev.findIndex((product) => product.id === nextProduct.id);
      if (existingIndex === -1) {
        return [nextProduct, ...prev];
      }

      const updated = [...prev];
      updated[existingIndex] = nextProduct;
      return updated;
    });
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawProducts = await getAdminProducts(session?.token);
      setProducts(rawProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(readApiError(err, "Impossible de charger les produits."));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogData = async () => {
    setCatalogLoading(true);
    const [categoriesResult, imagesResult, variantsResult] = await Promise.allSettled([
      session?.token
        ? getAdminCategories(session.token)
        : getPublicCategories().then((items) =>
            items.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              image: category.image,
              children: category.children ?? null,
            }))
          ),
      getAdminProductImages(session?.token),
      getAdminProductVariants(session?.token),
    ]);

    if (categoriesResult.status === "fulfilled") {
      setCategories(categoriesResult.value);
    } else {
      console.error("Error fetching categories:", categoriesResult.reason);
    }

    if (imagesResult.status === "fulfilled") {
      setProductImages(imagesResult.value);
    } else {
      console.error("Error fetching product images:", imagesResult.reason);
    }

    if (variantsResult.status === "fulfilled") {
      setProductVariants(variantsResult.value);
    } else {
      console.error("Error fetching product variants:", variantsResult.reason);
      setProductVariants([]);
    }

    if (categoriesResult.status === "rejected" && imagesResult.status === "rejected") {
      setError("Impossible de charger les catégories ou les images.");
    }

    setCatalogLoading(false);
  };

  useEffect(() => {
    void loadProducts();
    void loadCatalogData();
  }, [session?.token]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowAdvancedFields(false);
    setSelectedCategoryId("");
    setRelatedProductIds([]);
    setSelectedImageId("");
    setUploadedImages([]);
    setPreviewImageIndex(0);
    setEditingProductId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setError(null);
    setNotice(null);
    setShowModal(true);
  };

  const openEditModal = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setEditingProductId(product.id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      description: product.description || "",
      product_type: (product.product_type as ProductTypeEnum) || "RAW",
      price: product.price || "",
      stock: String(product.stock ?? 0),
      weight_grams: product.weight_grams != null ? String(product.weight_grams) : "",
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      is_top: Boolean(product.is_top),
      alt_text: product.images?.find((image) => image.is_primary)?.alt_text || product.name,
    });
    setSelectedCategoryId(
      typeof product.category === "object" ? product.category?.id || "" : String(product.category || "")
    );
    setRelatedProductIds(
      (product.related_products ?? []).map((item) => (typeof item === "string" ? item : item.id))
    );
    const primaryImageIndex = Math.max(
      product.images?.findIndex((image) => image.is_primary) ?? 0,
      0
    );
    setSelectedImageId(product.images?.find((image) => image.is_primary)?.id || "");
    setUploadedImages([]);
    setPreviewImageIndex(primaryImageIndex);
    setShowAdvancedFields(true);
    setError(null);
    setNotice(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleFormChange = (field: keyof ProductFormState, value: string | boolean) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !editingProductId
        ? { slug: slugify(String(value)), sku: makeSku(String(value)) }
        : {}),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    void Promise.all(
      files.map(
        (file) =>
          new Promise<UploadedProductImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = typeof reader.result === "string" ? reader.result : "";
              resolve({
                id: `${file.name}-${file.lastModified}`,
                file,
                preview: result,
                alt_text: file.name.replace(/\.[^.]+$/, ""),
              });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    ).then((nextImages) => {
      let hadExistingImages = false;

      setUploadedImages((prev) => {
        hadExistingImages = prev.length > 0;
        const mergedImages = [...prev];

        nextImages.forEach((image) => {
          if (!mergedImages.some((existingImage) => existingImage.id === image.id)) {
            mergedImages.push(image);
          }
        });

        return mergedImages;
      });
      setPreviewImageIndex((prev) => (hadExistingImages ? prev : 0));
      setSelectedImageId("");
      if (!form.alt_text && nextImages[0]?.alt_text) {
        setForm((prev) => ({ ...prev, alt_text: nextImages[0].alt_text }));
      }
      event.target.value = "";
    });
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    const validationErrors = validateProductForm(form, selectedCategoryId);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSaving(false);
      return;
    }

    if (!session?.token) {
      setError("Connecte-toi avec un compte admin pour enregistrer un produit.");
      setSaving(false);
      return;
    }

    try {
      const payload = buildProductPayload(form, selectedCategoryId, relatedProductIds);

      const savedProduct = editingProductId
        ? await updateAdminProduct(session.token, editingProductId, payload)
        : await createAdminProduct(session.token, payload);

      const pendingUploads =
        uploadedImages.length > 0
          ? uploadedImages.map((image, index) => ({
              product: savedProduct.id,
              image: image.file,
              alt_text: image.alt_text || form.alt_text || form.name,
              is_primary: index === 0,
              is_active: true,
            }))
          : [];

      let uploadedProductImages: AdminProductImage[] = [];

      if (pendingUploads.length > 0) {
        const uploadResults = await Promise.allSettled(
          pendingUploads.map((image) => createAdminProductImage(session.token, image))
        );

        uploadedProductImages = uploadResults
          .filter(
            (result): result is PromiseFulfilledResult<AdminProductImage> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value);

        const failedUploads = uploadResults.filter((result) => result.status === "rejected");
        if (failedUploads.length > 0) {
          console.error("Product image upload errors:", failedUploads);
          failedUploads.forEach((result) => {
            if (result.status === "rejected") {
              console.error("Product image upload error payload:", result.reason);
            }
          });
          setNotice(
            `${pendingUploads.length - failedUploads.length} image(s) liée(s) au produit, ${failedUploads.length} image(s) ont échoué.`
          );
        }
      } else if (selectedLibraryImage?.image) {
        setNotice("Le produit a été enregistré. L'image existante reste disponible dans la bibliothèque.");
      }

      const existingProduct = products.find((product) => product.id === savedProduct.id);
      const mergedImages =
        uploadedProductImages.length > 0
          ? [
              ...uploadedProductImages,
              ...(existingProduct?.images ?? savedProduct.images ?? []).filter(
                (image) => !uploadedProductImages.some((uploadedImage) => uploadedImage.id === image.id)
              ),
            ]
          : existingProduct?.images ?? savedProduct.images ?? [];

      const primaryUploadedImage =
        uploadedProductImages.find((image) => image.is_primary) || uploadedProductImages[0] || null;

      upsertProduct({
        ...existingProduct,
        ...savedProduct,
        images: mergedImages,
        primary_image:
          primaryUploadedImage?.image ||
          mergedImages.find((image) => image.is_primary)?.image ||
          mergedImages[0]?.image ||
          savedProduct.primary_image ||
          existingProduct?.primary_image ||
          null,
        image:
          primaryUploadedImage?.image ||
          mergedImages.find((image) => image.is_primary)?.image ||
          mergedImages[0]?.image ||
          savedProduct.image ||
          existingProduct?.image ||
          null,
      });

      if (uploadedProductImages.length > 0) {
        setProductImages((prev) => [
          ...uploadedProductImages,
          ...prev.filter((image) => !uploadedProductImages.some((uploadedImage) => uploadedImage.id === image.id)),
        ]);
      }

      closeModal();
      void Promise.all([loadProducts(), loadCatalogData()]);
    } catch (err) {
      console.error("Error saving product:", err);
      console.error("Product payload sent:", {
        category: selectedCategoryId || null,
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        sku: form.sku.trim(),
        description: form.description.trim(),
        product_type: form.product_type,
        price: form.price.trim(),
        stock: Number(form.stock || 0),
        weight_grams: Number(form.weight_grams || 0),
        seo_title: form.seo_title.trim(),
        seo_description: form.seo_description.trim(),
        is_top: form.is_top,
        selectedImageId,
        uploadedImages: uploadedImages.length,
      });
      setError(
        readApiError(
          err,
          editingProductId
            ? "Impossible de modifier le produit."
            : "Impossible de créer le produit."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!session?.token) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteAdminProduct(session.token, id);
      await loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(readApiError(err, "Impossible de supprimer le produit."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
          <p className="text-sm text-slate-500">
            
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {notice}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, SKU, catégorie..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary"
          />
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
          <Filter className="h-4 w-4" /> {filtered.length} resultat(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total produits", value: String(stats.total), icon: Package, color: "text-slate-700" },
          { label: "En stock", value: String(stats.inStock), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Stock faible", value: String(stats.lowStock), icon: AlertTriangle, color: "text-amber-600" },
          { label: "Variantes", value: String(stats.variants), icon: Package, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
            <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {["Produit", "SKU", "Prix", "Stock", "Statut", "Variantes", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                    Chargement des produits...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">IMG</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">{product.name}</p>
                          <p className="text-[10px] text-slate-500">{product.categoryName || "Sans catégorie"}</p>
                        </div>
                        {product.isTop && (
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            TOP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{product.sku}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {formatCurrency(parseFloat(product.price), "FCFA")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                          STOCK_BADGE[product.status]?.className || STOCK_BADGE.IN_STOCK.className
                        )}
                      >
                        {STOCK_BADGE[product.status]?.label || "En stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{product.variantsCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-orange-50 hover:text-primary"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingId === product.id}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProductId ? "Modifier le produit" : "Nouveau produit"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Champs Swagger ProductCreateUpdate — les images sont uploadees apres creation.
                  </p>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      category * <span className="text-slate-400">(UUID)</span>
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                    >
                      <option value="">Selectionner une categorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && !catalogLoading ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Cree d&apos;abord une categorie dans Admin → Categories.
                      </p>
                    ) : null}
                    {formErrors.category && <p className="mt-1 text-xs text-red-600">{formErrors.category}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      name * <span className="text-slate-400">(max 255)</span>
                    </label>
                    <input
                      value={form.name}
                      maxLength={255}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        sku * <span className="text-slate-400">(max 100)</span>
                      </label>
                      <input
                        value={form.sku}
                        maxLength={100}
                        onChange={(e) => handleFormChange("sku", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                      {formErrors.sku && <p className="mt-1 text-xs text-red-600">{formErrors.sku}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        slug <span className="text-slate-400">(max 50, nullable)</span>
                      </label>
                      <input
                        value={form.slug}
                        maxLength={50}
                        onChange={(e) => handleFormChange("slug", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      description <span className="text-slate-400">(nullable)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        price * <span className="text-slate-400">(decimal string)</span>
                      </label>
                      <input
                        inputMode="decimal"
                        value={form.price}
                        onChange={(e) => handleFormChange("price", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                      {formErrors.price && <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        stock <span className="text-slate-400">(integer, min 0)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.stock}
                        onChange={(e) => handleFormChange("stock", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                      {formErrors.stock && <p className="mt-1 text-xs text-red-600">{formErrors.stock}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        weight_grams <span className="text-slate-400">(nullable)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.weight_grams}
                        onChange={(e) => handleFormChange("weight_grams", e.target.value)}
                        placeholder="Laisser vide si non applicable"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        product_type *
                      </label>
                      <select
                        value={form.product_type}
                        onChange={(e) =>
                          handleFormChange("product_type", e.target.value as ProductTypeEnum)
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      >
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.product_type && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.product_type}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      related_products <span className="text-slate-400">(UUID[], optionnel)</span>
                    </label>
                    <select
                      multiple
                      value={relatedProductIds}
                      onChange={(e) =>
                        setRelatedProductIds(
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      className="min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-primary"
                    >
                      {products
                        .filter((product) => product.id !== editingProductId)
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Maintenir Ctrl/Cmd pour selectionner plusieurs produits.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFields((prev) => !prev)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">SEO & is_top</p>
                        <p className="text-xs text-slate-500">seo_title, seo_description, is_top</p>
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {showAdvancedFields ? "Masquer" : "Afficher"}
                      </span>
                    </button>

                    {showAdvancedFields ? (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              seo_title <span className="text-slate-400">(max 255)</span>
                            </label>
                            <input
                              value={form.seo_title}
                              maxLength={255}
                              onChange={(e) => handleFormChange("seo_title", e.target.value)}
                              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={form.is_top}
                                onChange={(e) => handleFormChange("is_top", e.target.checked)}
                              />
                              is_top
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            seo_description
                          </label>
                          <textarea
                            rows={3}
                            value={form.seo_description}
                            onChange={(e) => handleFormChange("seo_description", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-500">Téléverser une image</label>
                      <span className="text-[10px] font-medium text-primary">
                        {uploadedImages.length > 0
                          ? `${uploadedImages.length} image(s) sélectionnée(s)`
                          : "Aucune image sélectionnée"}
                      </span>
                    </div>
                    <label className="flex h-32 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-orange-50/40">
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-slate-400" />
                        <p className="mt-1 text-[11px] font-medium text-slate-600">Choisir une ou plusieurs images</p>
                        <p className="mt-1 text-[10px] text-slate-400">PNG, JPG ou WEBP</p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Les images seront liées automatiquement au produit après création.
                        </p>
                      </div>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Texte alternatif</label>
                    <input
                      value={form.alt_text}
                      onChange={(e) => handleFormChange("alt_text", e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-500">Prévisualisation</label>
                      <span className="text-[10px] text-slate-400">
                        {uploadedImages.length > 0
                          ? `${uploadedImages.length} image(s) prêtes pour ce produit`
                          : existingProductImages.length > 0
                            ? `${existingProductImages.length} image(s) déjà enregistrée(s)`
                          : catalogLoading
                            ? "Chargement..."
                            : `${productImages.length} image(s) disponibles`}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="relative flex h-72 items-center justify-center bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#f8fafc_100%)]">
                        {currentPreviewImage ? (
                          <Image
                            src={currentPreviewImage}
                            alt={currentPreviewAlt}
                            fill
                            className="object-contain p-4"
                            sizes="420px"
                          />
                        ) : (
                          <div className="text-center text-slate-400">
                            <Upload className="mx-auto h-6 w-6" />
                            <p className="mt-2 text-xs">Aucune image sélectionnée</p>
                          </div>
                        )}
                      </div>
                      {currentPreviewImage ? (
                        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
                          {uploadedImages.length > 0
                            ? `${uploadedImages.length} image(s) préparée(s) pour ce produit`
                            : currentExistingImage
                              ? "Image actuelle du produit"
                            : selectedImageId
                              ? "Image existante sélectionnée"
                              : "Nouvelle image importée"}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {existingProductImages.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Images actuelles du produit
                      </label>
                      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {existingProductImages.map((image, index) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => {
                              setPreviewImageIndex(index);
                              setSelectedImageId(image.id);
                              setUploadedImages([]);
                              if (!form.alt_text) {
                                setForm((prev) => ({ ...prev, alt_text: image.alt_text || prev.name }));
                              }
                            }}
                            className={cn(
                              "overflow-hidden rounded-xl border bg-white text-left transition-all",
                              currentExistingImage?.id === image.id && uploadedImages.length === 0
                                ? "border-primary ring-2 ring-primary/30 shadow-md"
                                : "border-slate-200 hover:border-primary/40"
                            )}
                          >
                            <div className="relative h-24 w-full bg-white">
                              <Image src={image.image} alt={image.alt_text || "Image produit"} fill className="object-contain p-2" sizes="120px" />
                            </div>
                            <div className="p-2">
                              <p className="truncate text-[10px] font-medium text-slate-700">
                                {image.is_primary ? "Image principale" : `Image ${index + 1}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {uploadedImages.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Images sélectionnées</label>
                      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {uploadedImages.map((image, index) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setPreviewImageIndex(index)}
                            className={cn(
                              "overflow-hidden rounded-xl border bg-white text-left transition-all",
                              previewImageIndex === index
                                ? "border-primary ring-2 ring-primary/30 shadow-md"
                                : "border-slate-200 hover:border-primary/40"
                            )}
                          >
                            <div className="relative h-24 w-full bg-white">
                              <Image src={image.preview} alt={image.alt_text} fill className="object-contain p-2" sizes="120px" />
                            </div>
                            <div className="p-2">
                              <p className="truncate text-[10px] font-medium text-slate-700">
                                {index === 0 ? "Image principale" : `Image ${index + 1}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Ou choisir une image existante</label>
                    <div className="grid max-h-56 grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                      {productImages.length === 0 ? (
                        <div className="col-span-2 rounded-lg border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-500">
                          Aucune image produit disponible.
                        </div>
                      ) : (
                        productImages.map((image) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => {
                              setSelectedImageId(image.id);
                              setUploadedImages([]);
                              setPreviewImageIndex(0);
                              if (!form.alt_text) {
                                setForm((prev) => ({ ...prev, alt_text: image.alt_text || prev.name }));
                              }
                            }}
                            className={cn(
                              "overflow-hidden rounded-xl border bg-white text-left transition-all",
                              selectedImageId === image.id
                                ? "border-primary ring-2 ring-primary/30 shadow-md"
                                : "border-slate-200 hover:border-primary/40"
                            )}
                          >
                            <div className="relative h-28 w-full bg-white">
                              <Image
                                src={image.image}
                                alt={image.alt_text || "Image produit"}
                                fill
                                className="object-contain p-2"
                                sizes="160px"
                              />
                            </div>
                            <div className="p-2">
                              <p className="truncate text-[10px] font-medium text-slate-700">
                                {image.alt_text || "Sans texte alternatif"}
                              </p>
                              <p className="mt-1 text-[9px] text-slate-400">
                                {image.is_primary ? "Image principale" : "Image secondaire"}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                    Le produit sera enregistré avec son nom, sa catégorie, son prix, son stock et son image principale.
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
                  onClick={handleSaveProduct}
                  disabled={
                    saving ||
                    !session?.token ||
                    !form.name.trim() ||
                    !form.sku.trim() ||
                    !form.price.trim() ||
                    !selectedCategoryId
                  }
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingProductId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


