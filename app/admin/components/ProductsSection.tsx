"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";
import { useConfirmDialog } from "@/components/admin/useConfirmDialog";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { hasAdminAccess } from "@/lib/auth";
import { cn, formatCurrency, isUuid, readApiError, resolveMediaUrl, sanitizeApiSlug, sanitizeDecimalPrice } from "@/lib/utils";
import ProductImagesPanel from "./ProductImagesPanel";
import ProductVariantsPanel from "./ProductVariantsPanel";
import {
  type AdminCatalogProductPayload,
  type ProductTypeEnum,
  createAdminProduct,
  createAdminProductImage,
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminCategories,
  getAdminProductById,
  getAdminProductImages,
  getAdminProducts,
  getAdminProductVariants,
  getCategories,
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
  slug?: string;
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

function makeUniqueSku(value: string, takenSkus: Iterable<string>) {
  const taken = new Set(Array.from(takenSkus, (sku) => sku.toLowerCase()));
  const base = makeSku(value);
  if (!taken.has(base.toLowerCase())) return base;

  for (let index = 2; index <= 999; index += 1) {
    const candidate = `${base.slice(0, 92)}_${index}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }

  return `${base.slice(0, 92)}_${Date.now().toString(36).slice(-6)}`;
}

function makeUniqueSlug(value: string, takenSlugs: Iterable<string>) {
  const taken = new Set(Array.from(takenSlugs, (slug) => slug.toLowerCase()));
  const base = slugify(value);
  if (!taken.has(base.toLowerCase())) return base;

  for (let index = 2; index <= 999; index += 1) {
    const candidate = `${base.slice(0, 45)}_${index}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }

  return `${base.slice(0, 45)}_${Date.now().toString(36).slice(-6)}`;
}

function flattenAdminCategories(categories: AdminCategory[]): AdminCategory[] {
  return categories.flatMap((category) => [
    category,
    ...(Array.isArray(category.children)
      ? flattenAdminCategories(category.children as AdminCategory[])
      : []),
  ]);
}

function collectTakenProductIdentifiers(catalogProducts: AdminCatalogProduct[]) {
  const skus = new Set<string>();
  const slugs = new Set<string>();

  catalogProducts.forEach((product) => {
    if (product.sku?.trim()) skus.add(product.sku.trim().toLowerCase());
    const slug = product.slug?.trim() || sanitizeApiSlug(product.name);
    if (slug) slugs.add(slug.toLowerCase());
  });

  return { skus, slugs };
}

function ensureUniqueProductIdentifiers(
  payload: AdminCatalogProductPayload,
  catalogProducts: AdminCatalogProduct[],
  editingProductId?: string | null
): AdminCatalogProductPayload {
  const relevantProducts = editingProductId
    ? catalogProducts.filter((product) => product.id !== editingProductId)
    : catalogProducts;
  const { skus, slugs } = collectTakenProductIdentifiers(relevantProducts);

  return {
    ...payload,
    sku: makeUniqueSku(payload.sku || payload.name, skus),
    slug: makeUniqueSlug(payload.slug || payload.name, slugs),
  };
}

function extractProductFormApiErrors(error: unknown): ProductFormErrors {
  const message = readApiError(error, "");
  const errors: ProductFormErrors = {};

  message.split("|").forEach((part) => {
    const match = part.trim().match(/^([a-z_]+):\s*(.+)$/i);
    if (!match) return;

    const field = match[1].toLowerCase();
    const detail = match[2].trim();
    if (field === "category") errors.category = detail;
    if (field === "sku") errors.sku = detail;
    if (field === "slug") errors.slug = detail;
    if (field === "name") errors.name = detail;
    if (field === "price") errors.price = detail;
  });

  return errors;
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
  if (!selectedCategoryId) {
    errors.category = "Sélectionnez une catégorie.";
  } else if (!isUuid(selectedCategoryId)) {
    errors.category = "Catégorie invalide. Rechargez la page ou choisissez une autre catégorie.";
  }
  if (!PRODUCT_TYPE_OPTIONS.some((option) => option.value === form.product_type)) {
    errors.product_type = "product_type* doit etre RAW, PROCESSED ou EXPORT.";
  }

  return errors;
}

function buildProductPayload(
  form: ProductFormState,
  selectedCategoryId: string,
  /*relatedProductIds: string[]*/
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
    /*related_products: relatedProductIds,*/
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
      resolveMediaUrl(
        product.images?.find((image) => image.is_primary)?.image ||
          product.images?.[0]?.image ||
          product.primary_image ||
          product.image ||
          product.image_url ||
          product.thumbnail ||
          ""
      ) ?? "",
    productType: product.product_type || "RAW",
    variantsCount: product.variants?.length || 0,
    isTop: Boolean(product.is_top),
  };
}

function revokePreviewUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function createUploadedImageFromFile(file: File): UploadedProductImage {
  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    file,
    preview: URL.createObjectURL(file),
    alt_text: file.name.replace(/\.[^.]+$/, ""),
  };
}

function getDisplayImageSrc(src: string) {
  return resolveMediaUrl(src) || src;
}

function AdminMediaImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const displaySrc = getDisplayImageSrc(src);
  if (!displaySrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={displaySrc} alt={alt} className={className} />
  );
}

function ImageRemoveButton({
  onClick,
  className,
  disabled = false,
  loading = false,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "absolute right-1 top-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/85 text-white shadow-md transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      aria-label="Supprimer définitivement l'image"
      title="Supprimer définitivement"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
    </button>
  );
}

function SelectableImageCard({
  selected,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition-all",
        selected ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-slate-200 hover:border-primary/40",
        className
      )}
    >
      {children}
    </div>
  );
}

function ProductImageTile({
  selected,
  onSelect,
  onRemove,
  showRemove = true,
  removing = false,
  imageSrc,
  imageAlt,
  imageHeightClass = "h-24",
  label,
  sublabel,
}: {
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showRemove?: boolean;
  removing?: boolean;
  imageSrc: string;
  imageAlt: string;
  imageHeightClass?: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="relative">
      <SelectableImageCard selected={selected} onSelect={onSelect}>
        <div className={cn("relative flex w-full items-center justify-center overflow-hidden bg-white", imageHeightClass)}>
          <AdminMediaImage
            src={imageSrc}
            alt={imageAlt}
            className="max-h-full max-w-full object-contain p-2"
          />
        </div>
        <div className="p-2">
          <p className="truncate text-[10px] font-medium text-slate-700">{label}</p>
          {sublabel ? <p className="mt-1 text-[9px] text-slate-400">{sublabel}</p> : null}
        </div>
      </SelectableImageCard>
      {showRemove ? (
        <ImageRemoveButton onClick={onRemove} loading={removing} disabled={removing} />
      ) : null}
    </div>
  );
}

function ProductImagePreviewPanel({
  previewSrc,
  previewAlt,
  onRemove,
  footer,
  meta,
}: {
  previewSrc: string;
  previewAlt: string;
  onRemove: () => void;
  footer?: string;
  meta?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-500">Prévisualisation</label>
        {meta ? <span className="text-[10px] text-slate-400">{meta}</span> : null}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="relative flex h-72 items-center justify-center bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#f8fafc_100%)]">
          {previewSrc ? (
            <>
              <AdminMediaImage
                src={previewSrc}
                alt={previewAlt}
                className="max-h-full max-w-full object-contain p-4"
              />
              <ImageRemoveButton onClick={onRemove} className="right-3 top-3" />
            </>
          ) : (
            <div className="text-center text-slate-400">
              <Upload className="mx-auto h-6 w-6" />
              <p className="mt-2 text-xs">Aucune image sélectionnée</p>
            </div>
          )}
        </div>
        {previewSrc && footer ? (
          <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const session = useAuthSession();
  const { confirm, confirmDialog } = useConfirmDialog();
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
  /*const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);*/
  const [selectedImageId, setSelectedImageId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedProductImage[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const [modalTab, setModalTab] = useState<"info" | "images" | "variants">("info");
  const [viewingProduct, setViewingProduct] = useState<AdminCatalogProduct | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [linkingLibraryImage, setLinkingLibraryImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadedImagesRef = useRef(uploadedImages);
  uploadedImagesRef.current = uploadedImages;

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
      variants:
        productVariants.length ||
        products.reduce((sum, product) => sum + (product.variants?.length ?? 0), 0),
    }),
    [rows, productVariants, products]
  );

  const selectedLibraryImage = productImages.find((image) => image.id === selectedImageId);
  const activeLibraryImage = !previewDismissed ? selectedLibraryImage : null;
  const editingProduct = editingProductId
    ? products.find((product) => product.id === editingProductId) ?? null
    : null;
  const existingProductImages = editingProduct?.images ?? [];
  const currentUploadedImage = uploadedImages[previewImageIndex];
  const currentExistingImage =
    uploadedImages.length === 0 && !activeLibraryImage && !previewDismissed
      ? existingProductImages[previewImageIndex] ?? existingProductImages[0]
      : null;
  const currentPreviewImage = getDisplayImageSrc(
    currentUploadedImage?.preview || activeLibraryImage?.image || currentExistingImage?.image || ""
  );
  const currentPreviewAlt =
    currentUploadedImage?.alt_text ||
    activeLibraryImage?.alt_text ||
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

  const loadCategories = async () => {
    setCatalogLoading(true);
    try {
      const nextCategories = session?.token
        ? flattenAdminCategories(await getAdminCategories(session.token))
        : (await getCategories()).map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            children: category.children ?? null,
          }));

      setCategories(nextCategories.filter((category) => Boolean(category.id && category.name)));
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(readApiError(err, "Impossible de charger les catégories."));
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadProductMedia = async () => {
    if (!session?.token) return;

    const [imagesResult, variantsResult] = await Promise.allSettled([
      getAdminProductImages(session.token),
      getAdminProductVariants(session.token),
    ]);

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
  };

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, [session?.token]);

  useEffect(() => {
    if (!showModal || !session?.token) return;
    void loadProductMedia();
  }, [showModal, session?.token]);

  const resetUploadInput = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const revokeUploadedPreviews = (images: UploadedProductImage[]) => {
    images.forEach((image) => revokePreviewUrl(image.preview));
  };

  const resetForm = () => {
    revokeUploadedPreviews(uploadedImages);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowAdvancedFields(false);
    setSelectedCategoryId("");
    /*setRelatedProductIds([]);*/ 
    setSelectedImageId("");
    setUploadedImages([]);
    setPreviewImageIndex(0);
    setPreviewDismissed(false);
    setModalTab("info");
    setEditingProductId(null);
    resetUploadInput();
  };

  const syncEditingProductImages = (nextImages: AdminProductImage[]) => {
    if (!editingProductId) return;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProductId ? { ...product, images: nextImages } : product
      )
    );
    setProductImages((prev) => {
      const merged = [...nextImages, ...prev.filter((image) => !nextImages.some((item) => item.id === image.id))];
      return merged;
    });
  };

  const syncProductVariants = (nextVariants: AdminProductVariant[]) => {
    setProductVariants(nextVariants);
    if (!editingProductId) return;

    const productVariantsForProduct = nextVariants.filter(
      (variant) => variant.product === editingProductId
    );
    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProductId
          ? { ...product, variants: productVariantsForProduct }
          : product
      )
    );
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
   /* setRelatedProductIds(
      (product.related_products ?? []).map((item) => (typeof item === "string" ? item : item.id))
    );*/
    const primaryImageIndex = Math.max(
      product.images?.findIndex((image) => image.is_primary) ?? 0,
      0
    );
    setSelectedImageId(product.images?.find((image) => image.is_primary)?.id || "");
    revokeUploadedPreviews(uploadedImages);
    setUploadedImages([]);
    setPreviewImageIndex(primaryImageIndex);
    setPreviewDismissed(false);
    setModalTab("info");
    setShowAdvancedFields(true);
    setError(null);
    setNotice(null);
    setShowModal(true);
  };

  const openDetailModal = async (productId: string) => {
    const cachedProduct = products.find((item) => item.id === productId);
    if (cachedProduct) {
      setViewingProduct(cachedProduct);
    }

    if (!session?.token) {
      return;
    }

    setViewingLoading(true);
    try {
      const freshProduct = await getAdminProductById(session.token, productId);
      setViewingProduct(freshProduct);
    } catch (err) {
      console.error("Error fetching product detail:", err);
      if (!cachedProduct) {
        setError(readApiError(err, "Impossible de charger le détail du produit."));
      }
    } finally {
      setViewingLoading(false);
    }
  };

  const handleLinkLibraryImage = async () => {
    if (!session?.token || !editingProductId || !selectedLibraryImage?.image) {
      return;
    }

    const alreadyLinked = existingProductImages.some((image) => image.id === selectedLibraryImage.id);
    if (alreadyLinked) {
      setNotice("Cette image est déjà liée au produit.");
      return;
    }

    setLinkingLibraryImage(true);
    setError(null);

    try {
      const savedImage = await createAdminProductImage(session.token, {
        product: editingProductId,
        image: selectedLibraryImage.image,
        alt_text: form.alt_text || selectedLibraryImage.alt_text || form.name,
        is_primary: existingProductImages.length === 0,
        is_active: true,
      });

      syncEditingProductImages([savedImage, ...existingProductImages]);
      setNotice("Image de la bibliothèque liée au produit.");
      setSelectedImageId(savedImage.id);
    } catch (err) {
      console.error("Error linking library image:", err);
      setError(readApiError(err, "Impossible de lier l'image au produit."));
    } finally {
      setLinkingLibraryImage(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError(null);
    setNotice(null);
  };

  const closeDetailModal = () => {
    setViewingProduct(null);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (editingProductId && modalTab === "images" && session?.token) {
      setUploadingImages(true);
      setError(null);
      setNotice(null);

      try {
        const uploadedImagesFromApi: AdminProductImage[] = [];

        for (const [index, file] of files.entries()) {
          const uploaded = await createAdminProductImage(session.token, {
            product: editingProductId,
            image: file,
            alt_text: file.name.replace(/\.[^.]+$/, "") || form.alt_text || form.name,
            is_primary: existingProductImages.length === 0 && index === 0,
            is_active: true,
          });
          uploadedImagesFromApi.push(uploaded);
        }

        syncEditingProductImages([...existingProductImages, ...uploadedImagesFromApi]);
        setNotice(
          uploadedImagesFromApi.length > 1
            ? `${uploadedImagesFromApi.length} images ajoutées au produit.`
            : "Image ajoutée au produit."
        );
      } catch (uploadError) {
        console.error("Error uploading product image:", uploadError);
        setError(readApiError(uploadError, "Impossible d'ajouter l'image au produit."));
      } finally {
        setUploadingImages(false);
      }

      return;
    }

    const nextImages = files.map(createUploadedImageFromFile);

    setUploadedImages((prev) => {
      const mergedImages = [...prev];
      nextImages.forEach((image) => {
        if (!mergedImages.some((existingImage) => existingImage.id === image.id)) {
          mergedImages.push(image);
        } else {
          revokePreviewUrl(image.preview);
        }
      });

      if (prev.length === 0) {
        setPreviewImageIndex(0);
      }

      return mergedImages;
    });

    setPreviewDismissed(false);
    setSelectedImageId("");

    if (!form.alt_text && nextImages[0]?.alt_text) {
      setForm((prev) => ({ ...prev, alt_text: nextImages[0].alt_text }));
    }

    resetUploadInput();
  };

  const removeUploadedImage = (index: number) => {
    const removed = uploadedImages[index];
    if (removed) {
      revokePreviewUrl(removed.preview);
    }

    const next = uploadedImages.filter((_, itemIndex) => itemIndex !== index);

    let nextPreview = previewImageIndex;
    if (next.length === 0) {
      nextPreview = 0;
      setPreviewDismissed(true);
      setSelectedImageId("");
      resetUploadInput();
    } else if (index < previewImageIndex) {
      nextPreview = previewImageIndex - 1;
    } else if (index === previewImageIndex) {
      nextPreview = Math.min(previewImageIndex, next.length - 1);
    }

    setUploadedImages(next);
    setPreviewImageIndex(nextPreview);
  };

  const clearAllUploadedImages = () => {
    revokeUploadedPreviews(uploadedImages);
    setUploadedImages([]);
    setPreviewImageIndex(0);
    setPreviewDismissed(true);
    setSelectedImageId("");
    resetUploadInput();
  };

  const dismissPreview = () => {
    setSelectedImageId("");
    setPreviewDismissed(true);
    resetUploadInput();
  };

  const clearPreviewSelection = () => {
    if (uploadedImages.length > 0) {
      if (uploadedImages.length === 1) {
        clearAllUploadedImages();
        return;
      }

      removeUploadedImage(previewImageIndex);
      return;
    }

    if (activeLibraryImage) {
      void handlePermanentDeleteImage(activeLibraryImage);
      return;
    }

    if (currentExistingImage) {
      void handlePermanentDeleteImage(currentExistingImage);
      return;
    }

    dismissPreview();
  };

  const handlePermanentDeleteImage = async (image: AdminProductImage) => {
    if (!session?.token) {
      setError("Connecte-toi avec un compte admin pour supprimer une image.");
      return;
    }

    const confirmed = await confirm({
      title: "Supprimer l'image",
      description:
        "Supprimer définitivement cette image ? Elle sera retirée du produit et de la bibliothèque.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingImageId(image.id);
    setError(null);

    try {
      await deleteAdminProductImage(session.token, image.id);

      setProductImages((prev) => prev.filter((item) => item.id !== image.id));

      if (editingProductId) {
        const nextImages = existingProductImages.filter((item) => item.id !== image.id);
        syncEditingProductImages(nextImages);
        setPreviewImageIndex((current) =>
          Math.min(current, Math.max(0, nextImages.length - 1))
        );
      }

      if (selectedImageId === image.id) {
        setSelectedImageId("");
        setPreviewDismissed(true);
      }

      setNotice("Image supprimée définitivement.");
    } catch (err) {
      console.error("Error deleting product image:", err);
      setError(readApiError(err, "Impossible de supprimer l'image."));
    } finally {
      setDeletingImageId(null);
    }
  };

  const requestPermanentDeleteImage = (image: AdminProductImage) => {
    void handlePermanentDeleteImage(image);
  };

  useEffect(() => {
    return () => {
      revokeUploadedPreviews(uploadedImagesRef.current);
    };
  }, []);

  const handleSaveProduct = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    const validationErrors = validateProductForm(form, selectedCategoryId);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError("Complétez les champs obligatoires : catégorie, nom, SKU et prix.");
      setSaving(false);
      return;
    }

    if (!session?.token) {
      setError("Connecte-toi avec un compte admin pour enregistrer un produit.");
      setSaving(false);
      return;
    }

    if (!hasAdminAccess(session)) {
      setError("Ce compte n'a pas le rôle platform_admin requis pour créer un produit.");
      setSaving(false);
      return;
    }

    try {
      let payload = buildProductPayload(form, selectedCategoryId);
      if (!editingProductId) {
        payload = ensureUniqueProductIdentifiers(payload, products);
        setForm((prev) => ({ ...prev, sku: payload.sku, slug: payload.slug }));
      }

      const savedProduct = editingProductId
        ? await updateAdminProduct(session.token, editingProductId, payload)
        : await createAdminProduct(session.token, payload);

      const productId = savedProduct.id || editingProductId;

      if (!productId) {
        throw new Error("Impossible de determiner l'identifiant du produit apres enregistrement.");
      }

      const pendingUploads =
        uploadedImages.length > 0
          ? uploadedImages.map((image, index) => ({
              product: productId,
              image: image.file,
              alt_text: image.alt_text || form.alt_text || form.name,
              is_primary: index === 0,
              is_active: true,
            }))
          : [];

      let uploadedProductImages: AdminProductImage[] = [];
      const failedUploads: unknown[] = [];

      if (pendingUploads.length > 0) {
        for (const image of pendingUploads) {
          try {
            const uploaded = await createAdminProductImage(session.token, image);
            uploadedProductImages.push(uploaded);
          } catch (uploadError) {
            console.error("Product image upload error:", uploadError);
            failedUploads.push(uploadError);
          }
        }

        if (failedUploads.length > 0) {
          const firstError = failedUploads[0];
          const detail = readApiError(firstError, "Erreur inconnue");
          setNotice(
            `${uploadedProductImages.length} image(s) liée(s) au produit, ${failedUploads.length} image(s) ont échoué. ${detail}`
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

      setNotice(
        editingProductId
          ? "Produit modifié avec succès."
          : "Produit créé avec succès."
      );
      setShowModal(false);
      resetForm();
      void loadProducts();
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

      const apiFieldErrors = extractProductFormApiErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      }

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

    const confirmed = await confirm({
      title: "Supprimer le produit",
      description: "Cette action est définitive. Le produit et ses données associées seront supprimés.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

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
          type="button"
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

      {!hasAdminAccess(session) && session?.token ? (
        <AdminAccessNotice
          title="Création de produits indisponible"
          description="La liste peut s'afficher via le catalogue public, mais la création et la modification nécessitent le rôle platform_admin."
        />
      ) : null}

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
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          {product.image ? (
                            <AdminMediaImage
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
                        <button
                          onClick={() => void openDetailModal(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        >
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
              className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProductId ? "Modifier le produit" : "Nouveau produit"}
                  </h3>
                  {editingProductId ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          { id: "info", label: "Informations" },
                          { id: "images", label: "Images" },
                          { id: "variants", label: "Variantes" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalTab(tab.id)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                            modalTab === tab.id
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-primary"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    Champs Swagger ProductCreateUpdate — les images sont uploadees apres creation.
                  </p>
                </div>
                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {editingProductId && modalTab === "variants" && session?.token ? (
                <ProductVariantsPanel
                  productId={editingProductId}
                  token={session.token}
                  variants={productVariants}
                  onVariantsChange={syncProductVariants}
                  onNotice={setNotice}
                  onError={setError}
                />
              ) : editingProductId && modalTab === "images" && session?.token ? (
                <div className="space-y-4">
                  <ProductImagesPanel
                    productId={editingProductId}
                    token={session.token}
                    images={existingProductImages}
                    onImagesChange={syncEditingProductImages}
                    onNotice={setNotice}
                    onError={setError}
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Téléverser une nouvelle image
                    </label>
                    <label className="flex h-28 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-orange-50/40">
                      <div className="text-center">
                        {uploadingImages ? (
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <Upload className="mx-auto h-6 w-6 text-slate-400" />
                        )}
                        <p className="mt-1 text-[11px] font-medium text-slate-600">
                          {uploadingImages
                            ? "Envoi en cours..."
                            : "Choisir une ou plusieurs images (ajout immédiat)"}
                        </p>
                      </div>
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingImages}
                        onChange={(event) => void handleImageUpload(event)}
                      />
                    </label>
                  </div>

                  <ProductImagePreviewPanel
                    previewSrc={currentPreviewImage}
                    previewAlt={currentPreviewAlt}
                    onRemove={clearPreviewSelection}
                    meta={
                      uploadedImages.length > 0
                        ? `${uploadedImages.length} image(s) prête(s) à enregistrer`
                        : `${existingProductImages.length} image(s) enregistrée(s)`
                    }
                    footer={
                      uploadedImages.length > 0
                        ? "Ces images seront enregistrées depuis l'onglet Informations."
                        : undefined
                    }
                  />

                  {uploadedImages.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Images sélectionnées
                      </label>
                      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {uploadedImages.map((image, index) => (
                          <ProductImageTile
                            key={image.id}
                            selected={previewImageIndex === index}
                            onSelect={() => setPreviewImageIndex(index)}
                            onRemove={() => removeUploadedImage(index)}
                            imageSrc={image.preview}
                            imageAlt={image.alt_text}
                            label={index === 0 ? "Image principale" : `Image ${index + 1}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-amber-700">
                        {uploadedImages.length} image(s) seront liées au produit lors de l&apos;enregistrement
                        (onglet Informations).
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-500">
                        Bibliothèque d&apos;images
                      </label>
                      {selectedLibraryImage && !existingProductImages.some((image) => image.id === selectedLibraryImage.id) ? (
                        <button
                          type="button"
                          disabled={linkingLibraryImage}
                          onClick={() => void handleLinkLibraryImage()}
                          className="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
                        >
                          {linkingLibraryImage ? "Liaison..." : "Lier au produit"}
                        </button>
                      ) : null}
                    </div>
                    <div className="grid max-h-56 grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                      {productImages.map((image) => (
                        <ProductImageTile
                          key={image.id}
                          selected={selectedImageId === image.id}
                          onSelect={() => {
                            setSelectedImageId(image.id);
                            setPreviewDismissed(false);
                            setUploadedImages([]);
                            setPreviewImageIndex(0);
                          }}
                          onRemove={() => requestPermanentDeleteImage(image)}
                          removing={deletingImageId === image.id}
                          imageSrc={image.image}
                          imageAlt={image.alt_text || "Image produit"}
                          imageHeightClass="h-28"
                          label={image.alt_text || "Sans texte alternatif"}
                          sublabel={image.is_primary ? "Image principale" : "Image secondaire"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      category * <span className="text-slate-400">(UUID)</span>
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setFormErrors((prev) => ({ ...prev, category: undefined }));
                      }}
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
                        onChange={(e) => {
                          handleFormChange("sku", e.target.value);
                          setFormErrors((prev) => ({ ...prev, sku: undefined }));
                        }}
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
                        onChange={(e) => {
                          handleFormChange("slug", e.target.value);
                          setFormErrors((prev) => ({ ...prev, slug: undefined }));
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
                      />
                      {formErrors.slug && <p className="mt-1 text-xs text-red-600">{formErrors.slug}</p>}
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

                {/*  <div>
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
                  </div>*/}

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
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => void handleImageUpload(event)}
                      />
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

                  <ProductImagePreviewPanel
                    previewSrc={currentPreviewImage}
                    previewAlt={currentPreviewAlt}
                    onRemove={clearPreviewSelection}
                    meta={
                      uploadedImages.length > 0
                        ? `${uploadedImages.length} image(s) prête(s) pour ce produit`
                        : existingProductImages.length > 0
                          ? `${existingProductImages.length} image(s) déjà enregistrée(s)`
                          : catalogLoading
                            ? "Chargement..."
                            : `${productImages.length} image(s) disponibles`
                    }
                    footer={
                      uploadedImages.length > 0
                        ? `${uploadedImages.length} image(s) seront liées au produit lors de l'enregistrement.`
                        : currentExistingImage
                          ? "Image actuelle du produit"
                          : activeLibraryImage
                            ? "Image existante sélectionnée"
                            : undefined
                    }
                  />

                  {uploadedImages.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Images sélectionnées</label>
                      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {uploadedImages.map((image, index) => (
                          <ProductImageTile
                            key={image.id}
                            selected={previewImageIndex === index}
                            onSelect={() => setPreviewImageIndex(index)}
                            onRemove={() => removeUploadedImage(index)}
                            imageSrc={image.preview}
                            imageAlt={image.alt_text}
                            label={index === 0 ? "Image principale" : `Image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {existingProductImages.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Images actuelles du produit
                      </label>
                      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {existingProductImages.map((image, index) => (
                          <ProductImageTile
                            key={image.id}
                            selected={
                              currentExistingImage?.id === image.id &&
                              uploadedImages.length === 0 &&
                              !previewDismissed
                            }
                            onSelect={() => {
                              setPreviewImageIndex(index);
                              setSelectedImageId(image.id);
                              setPreviewDismissed(false);
                              setUploadedImages([]);
                              if (!form.alt_text) {
                                setForm((prev) => ({ ...prev, alt_text: image.alt_text || prev.name }));
                              }
                            }}
                            onRemove={() => requestPermanentDeleteImage(image)}
                            removing={deletingImageId === image.id}
                            imageSrc={image.image}
                            imageAlt={image.alt_text || "Image produit"}
                            label={image.is_primary ? "Image principale" : `Image ${index + 1}`}
                          />
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
                          <ProductImageTile
                            key={image.id}
                            selected={selectedImageId === image.id}
                            onSelect={() => {
                              setSelectedImageId(image.id);
                              setPreviewDismissed(false);
                              setUploadedImages([]);
                              setPreviewImageIndex(0);
                              if (!form.alt_text) {
                                setForm((prev) => ({ ...prev, alt_text: image.alt_text || prev.name }));
                              }
                            }}
                            onRemove={() => requestPermanentDeleteImage(image)}
                            removing={deletingImageId === image.id}
                            imageSrc={image.image}
                            imageAlt={image.alt_text || "Image produit"}
                            imageHeightClass="h-28"
                            label={image.alt_text || "Sans texte alternatif"}
                            sublabel={image.is_primary ? "Image principale" : "Image secondaire"}
                          />
                        ))
                      )}
                    </div>
                  </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                    Le produit sera enregistré avec son nom, sa catégorie, son prix, son stock et son image principale.
                  </div>
                </div>
              </div>
              )}

              {showModal && error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              {showModal && notice ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {notice}
                </div>
              ) : null}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  {editingProductId && modalTab !== "info" ? "Fermer" : "Annuler"}
                </button>
                {!editingProductId || modalTab === "info" ? (
                <button
                  type="button"
                  onClick={() => void handleSaveProduct()}
                  disabled={saving || !session?.token}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingProductId ? "Enregistrer" : "Créer"}
                </button>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingProduct ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeDetailModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewingProduct.name}</h3>
                  <p className="text-xs text-slate-500">ProductDetail — lecture seule</p>
                </div>
                <button onClick={closeDetailModal} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {viewingLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Chargement...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">id:</span> <span className="font-mono text-xs">{viewingProduct.id}</span></div>
                    <div><span className="text-slate-500">sku:</span> {viewingProduct.sku}</div>
                    <div><span className="text-slate-500">slug:</span> {viewingProduct.slug || "—"}</div>
                    <div><span className="text-slate-500">product_type:</span> {viewingProduct.product_type}</div>
                    <div><span className="text-slate-500">price:</span> {formatCurrency(parseFloat(viewingProduct.price), "FCFA")}</div>
                    <div><span className="text-slate-500">stock:</span> {viewingProduct.stock ?? 0}</div>
                    <div><span className="text-slate-500">weight_grams:</span> {viewingProduct.weight_grams ?? "—"}</div>
                    <div><span className="text-slate-500">is_in_stock:</span> {viewingProduct.is_in_stock || "—"}</div>
                    <div><span className="text-slate-500">is_top:</span> {viewingProduct.is_top ? "Oui" : "Non"}</div>
                    <div><span className="text-slate-500">note_produit:</span> {viewingProduct.note_produit ?? "—"}</div>
                    <div><span className="text-slate-500">count_ratings:</span> {viewingProduct.count_ratings ?? 0}</div>
                    <div><span className="text-slate-500">count_favorites:</span> {viewingProduct.count_favorites ?? 0}</div>
                  </div>

                  {viewingProduct.description ? (
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-500">description</p>
                      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        {viewingProduct.description}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      images ({viewingProduct.images?.length ?? 0})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {(viewingProduct.images ?? []).map((image) => (
                        <div key={image.id} className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <AdminMediaImage
                            src={image.image}
                            alt={image.alt_text || "Image"}
                            className="max-h-full max-w-full object-contain p-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      variants ({viewingProduct.variants?.length ?? 0})
                    </p>
                    {(viewingProduct.variants ?? []).length === 0 ? (
                      <p className="text-xs text-slate-500">Aucune variante.</p>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              {["name", "sku", "price", "stock", "is_active"].map((header) => (
                                <th key={header} className="px-3 py-2 font-semibold text-slate-500">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(viewingProduct.variants ?? []).map((variant) => (
                              <tr key={variant.id} className="border-t border-slate-100">
                                <td className="px-3 py-2">{variant.name}</td>
                                <td className="px-3 py-2">{variant.sku || "—"}</td>
                                <td className="px-3 py-2">{formatCurrency(parseFloat(variant.price), "FCFA")}</td>
                                <td className="px-3 py-2">{variant.stock ?? 0}</td>
                                <td className="px-3 py-2">{variant.is_active ?? true ? "Oui" : "Non"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        closeDetailModal();
                        openEditModal(viewingProduct.id);
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={closeDetailModal}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {confirmDialog}
    </div>
  );
}


