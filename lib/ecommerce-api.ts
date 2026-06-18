import { mergeOrderWithPromoMeta } from "@/lib/order-promo-meta";
import { parseApiErrorPayload, parseDjangoHtmlError, resolveMediaUrl, sanitizeApiSlug, sanitizeDecimalPrice } from "@/lib/utils";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parent?: string | null;
  children?: PublicCategory[];
};

export type ProductFilters = {
  category?: string;
  min_price?: number;
  max_price?: number;
  stock_status?: string;
  ordering?: string;
  search?: string;
  page?: number;
  page_size?: number;
  is_featured?: boolean;
  is_boosted?: boolean;
  is_top?: boolean;
  product_type?: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price?: string | null;
  currency?: string;
  stock_status?: string;
  category_name?: string;
  primary_image?: string | null;
  avg_rating?: number;
  review_count?: number;
  note_produit?: string;
  count_ratings?: number;
  count_favorites?: number;
  is_featured?: boolean;
  is_boosted?: boolean;
  labels?: string[];
};

export type PublicPromoProduct = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export type PublicPromoCode = {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  type_display?: string;
  value: string;
  starts_at?: string;
  expires_at?: string | null;
  applicable_product_labels?: PublicPromoProduct[];
};

export type PublicBanner = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_label?: string;
  cta_url?: string;
  banner_type: "carousel" | "popup" | "hero" | "side_banner";
  position: number;
};

export type PublicFlashSale = {
  id: string;
  product_id?: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  sale_price: string;
  original_price: string;
  discount_percent: number;
  remaining_stock?: number | null;
  ends_at: string;
};

export type AdminPromoCode = {
  id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  is_active: boolean;
  number_times_used: number;
  starts_at?: string;
  expires_at?: string | null;
  restricted_to_tiers?: string[];
  restricted_to_users?: number[];
  applicable_products?: string[];
  applicable_product_labels?: Array<{
    id: string;
    name: string;
    sku?: string;
  }>;
  restricted_user_labels?: Array<{
    id: number;
    email: string;
    name: string;
  }>;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  children?: string | AdminCategory[] | null;
};

export type AdminCategoryPayload = {
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: File | string;
};

export type ProductTypeEnum = "RAW" | "PROCESSED" | "EXPORT";

export type AdminProductImage = {
  id: string;
  product?: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AdminProductImagePayload = {
  product: string;
  image: File | string;
  alt_text: string;
  is_primary: boolean;
  is_active?: boolean;
};

export type AdminProductImagePatchPayload = Partial<{
  product: string;
  image: File | string;
  alt_text: string;
  is_primary: boolean;
  is_active: boolean;
}>;

export type AdminProductVariant = {
  id: string;
  product?: string;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  weight_grams: number | null;
  is_active?: boolean;
  is_in_stock?: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminProductVariantPayload = {
  product: string;
  name: string;
  sku?: string | null;
  price: string;
  stock: number;
  weight_grams?: number | null;
  is_active?: boolean;
};

export type AdminProductVariantPatchPayload = Partial<AdminProductVariantPayload>;

export type AdminCatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  product_type?: string;
  price: string;
  stock: number;
  weight_grams: number;
  seo_title?: string;
  seo_description?: string;
  is_top?: boolean;
  is_in_stock?: string;
  category?: AdminCategory | string | null;
  image?: string | null;
  primary_image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  images?: AdminProductImage[];
  variants?: AdminProductVariant[];
  /*related_products?: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: string;
    stock: number;
    is_top: boolean;
    product_type: string;
    category_name: string;
    primary_image: string | null;
  }>;*/
  note_produit?: string;
  count_ratings?: number;
  count_favorites?: number;
};

export type AdminCatalogProductPayload = {
  category: string;
  name: string;
  slug?: string | null;
  sku: string;
  description?: string | null;
  product_type: ProductTypeEnum;
  price: string;
  stock?: number;
  weight_grams?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_top?: boolean | null;
  /*related_products?: string[];*/
  images?: Array<{
    image: string;
    alt_text?: string;
    is_primary?: boolean;
    is_active?: boolean;
  }>;
};

type Paginated<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  items?: T[];
  data?: T[];
};

type PublicProductImage = {
  id?: string;
  product?: string;
  image?: string | null;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type PublicProductRecord = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: string;
  stock?: number;
  compare_at_price?: string | null;
  currency?: string;
  stock_status?: string;
  is_in_stock?: string | boolean;
  category_name?: string;
  avg_rating?: number;
  review_count?: number;
  note_produit?: string;
  count_ratings?: number;
  count_favorites?: number;
  is_featured?: boolean;
  is_top?: boolean;
  is_boosted?: boolean;
  labels?: string[];
  product_type?: string;
  description?: string;
  primary_image?: string | PublicProductImage | null;
  image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  images?: PublicProductImage[];
  category?: PublicCategory | string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}

function readFetchErrorMessage(text: string, status: number, path: string) {
  if (!text.trim()) {
    if (status === 403) {
      if (path.includes("/commandes/validate-commandes")) {
        return "Commande refusée : connectez-vous avec un compte client (customer), pas un compte administrateur.";
      }
      return "Accès refusé.";
    }
    return `Erreur API ${status} sur ${path}`;
  }

  try {
    const parsed = parseApiErrorPayload(JSON.parse(text), text.trim());
    if (parsed && /invalid token|token non valide/i.test(parsed)) {
      return "Votre session a expiré. Reconnectez-vous pour confirmer la commande.";
    }
    if (parsed && status === 403 && path.includes("/commandes/validate-commandes")) {
      if (/permission|admin|platform_admin/i.test(parsed)) {
        return "Commande refusée : connectez-vous avec un compte client (customer), pas un compte administrateur.";
      }
    }
    return parsed;
  } catch {
    const djangoMessage = parseDjangoHtmlError(text);
    if (djangoMessage) {
      return djangoMessage;
    }

    if (status === 403) {
      if (path.includes("/commandes/validate-commandes")) {
        return "Commande refusée : connectez-vous avec un compte client (customer), pas un compte administrateur.";
      }
      if (path.includes("/admin/")) {
        return "Accès refusé : ce compte n'a pas le rôle platform_admin requis pour les actions admin.";
      }
      return "Accès refusé.";
    }

    const trimmed = text.trim();
    return trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
  }
}

function sanitizeAdminCategoryPayload(payload: AdminCategoryPayload): AdminCategoryPayload {
  const name = payload.name.trim().slice(0, 100);
  const slug = sanitizeApiSlug(payload.slug ?? "", name);
  const description = payload.description?.trim() || null;

  return {
    ...payload,
    name,
    slug,
    description,
  };
}

function sanitizeAdminProductPayload(payload: AdminCatalogProductPayload): AdminCatalogProductPayload {
  const weightRaw = payload.weight_grams;
  const hasWeight =
    weightRaw !== null && weightRaw !== undefined && String(weightRaw).trim() !== "";

  return {
    category: payload.category.trim(),
    name: payload.name.trim().slice(0, 255),
    slug: sanitizeApiSlug(payload.slug ?? "", payload.name),
    sku: payload.sku.trim().slice(0, 100),
    description: payload.description?.trim() || null,
    product_type: payload.product_type,
    price: sanitizeDecimalPrice(payload.price),
    stock: Math.max(0, Math.min(2147483647, Number(payload.stock) || 0)),
    weight_grams: hasWeight
      ? Math.max(0, Math.min(2147483647, Number(weightRaw) || 0))
      : null,
    seo_title: payload.seo_title?.trim().slice(0, 255) || null,
    seo_description: payload.seo_description?.trim() || null,
    is_top: payload.is_top ?? false,
    /*related_products: payload.related_products ?? [],*/
  };
}

function buildQueryString(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function toAbsoluteUrl(value: string | null | undefined) {
  return resolveMediaUrl(value);
}

function extractCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Paginated<T>;

    if (Array.isArray(record.results)) {
      return record.results;
    }

    if (Array.isArray(record.items)) {
      return record.items;
    }

    if (Array.isArray(record.data)) {
      return record.data;
    }
  }

  return [];
}

async function fetchJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(readFetchErrorMessage(text, response.status, path));
  }

  return (await response.json()) as T;
}

async function getFirstWorkingPayload<T>(paths: string[], init?: RequestInit) {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await fetchJson<T>(path, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function isTransientBackendError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("too many clients") ||
    normalized.includes("operationalerror") ||
    normalized.includes("postgresql est satur") ||
    normalized.includes("connection failed") ||
    normalized.includes("fetch failed")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMutation<T>(
  path: string,
  init: RequestInit,
  options?: { retries?: number }
) {
  const maxAttempts = (options?.retries ?? 0) + 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      const message = readFetchErrorMessage(text, response.status, path);
      lastError = new Error(message);

      if (attempt < maxAttempts - 1 && isTransientBackendError(message)) {
        await sleep(900 * (attempt + 1));
        continue;
      }

      throw lastError;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  throw lastError ?? new Error(`Erreur API sur ${path}`);
}

async function fetchMutationFirst<T>(paths: string[], init: RequestInit) {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await fetchMutation<T>(path, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function authHeaders(token: string) {
  return {
    Authorization: `Token ${token}`,
  };
}

function normalizeAdminProductImage(image: AdminProductImage) {
  return {
    ...image,
    image: toAbsoluteUrl(image.image) ?? image.image,
  };
}

function buildProductImageFormData(
  payload: AdminProductImagePatchPayload & { product?: string }
) {
  const productValue = String(payload.product ?? "").trim();
  if (!productValue) {
    throw new Error("Impossible d'envoyer l'image sans identifiant produit.");
  }

  const formData = new FormData();
  formData.append("product", productValue);

  if (payload.image instanceof File) {
    formData.append("image", payload.image, payload.image.name);
  } else if (typeof payload.image === "string" && payload.image.trim()) {
    formData.append("image", payload.image.trim());
  }

  if (payload.alt_text !== undefined) {
    formData.append("alt_text", payload.alt_text);
  }
  if (payload.is_primary !== undefined) {
    formData.append("is_primary", String(payload.is_primary));
  }
  if (payload.is_active !== undefined) {
    formData.append("is_active", String(payload.is_active));
  }

  return formData;
}

function buildProductImageJsonBody(payload: AdminProductImagePatchPayload & { product: string }) {
  const body: Record<string, unknown> = { product: payload.product };

  if (typeof payload.image === "string" && payload.image.trim()) {
    body.image = payload.image.trim();
  }
  if (payload.alt_text !== undefined) {
    body.alt_text = payload.alt_text;
  }
  if (payload.is_primary !== undefined) {
    body.is_primary = payload.is_primary;
  }
  if (payload.is_active !== undefined) {
    body.is_active = payload.is_active;
  }

  return JSON.stringify(body);
}

function sanitizeAdminProductVariantPayload(
  payload: AdminProductVariantPayload | AdminProductVariantPatchPayload
) {
  const sanitized: Record<string, unknown> = {};

  if (payload.product !== undefined) {
    sanitized.product = payload.product;
  }
  if (payload.name !== undefined) {
    sanitized.name = String(payload.name).trim().slice(0, 100);
  }
  if (payload.sku !== undefined) {
    const sku = payload.sku == null ? null : String(payload.sku).trim().slice(0, 100);
    sanitized.sku = sku || null;
  }
  if (payload.price !== undefined) {
    sanitized.price = sanitizeDecimalPrice(String(payload.price));
  }
  if (payload.stock !== undefined) {
    sanitized.stock = Math.max(0, Math.floor(Number(payload.stock) || 0));
  }
  if (payload.weight_grams !== undefined) {
    sanitized.weight_grams =
      payload.weight_grams == null ? null : Math.max(0, Math.floor(Number(payload.weight_grams)));
  }
  if (payload.is_active !== undefined) {
    sanitized.is_active = payload.is_active;
  }

  return sanitized;
}

function normalizeAdminProduct(product: AdminCatalogProduct, fallbackId?: string) {
  const primaryImageUrl =
    readImageUrl(product.primary_image) ??
    readImageUrl(product.image) ??
    readImageUrl(product.image_url) ??
    readImageUrl(product.thumbnail);

  return {
    ...product,
    id: product.id || fallbackId || "",
    image: primaryImageUrl ?? toAbsoluteUrl(product.image),
    primary_image: primaryImageUrl ?? toAbsoluteUrl(product.primary_image as string | null | undefined),
    image_url: primaryImageUrl ?? toAbsoluteUrl(product.image_url),
    thumbnail: primaryImageUrl ?? toAbsoluteUrl(product.thumbnail),
    images: (product.images ?? []).map(normalizeAdminProductImage),
  };
}

function buildAdminCategoryBody(payload: AdminCategoryPayload) {
  const sanitized = sanitizeAdminCategoryPayload(payload);
  const hasFile = typeof File !== "undefined" && sanitized.image instanceof File;

  if (!hasFile) {
    return JSON.stringify({
      name: sanitized.name,
      slug: sanitized.slug,
      description: sanitized.description,
      ...(typeof sanitized.image === "string" && sanitized.image.trim()
        ? { image: sanitized.image.trim() }
        : {}),
    });
  }

  const formData = new FormData();
  const imageFile = sanitized.image as File;
  formData.append("name", sanitized.name);
  if (sanitized.slug) {
    formData.append("slug", sanitized.slug);
  }
  if (sanitized.description) {
    formData.append("description", sanitized.description);
  }
  formData.append("image", imageFile, imageFile.name);
  return formData;
}

function readImageUrl(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return resolveMediaUrl(value.trim());
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nestedImage = record.image;
    const nestedUrl = record.url;

    if (typeof nestedImage === "string" && nestedImage.trim()) {
      return resolveMediaUrl(nestedImage.trim());
    }

    if (typeof nestedUrl === "string" && nestedUrl.trim()) {
      return resolveMediaUrl(nestedUrl.trim());
    }
  }

  return null;
}

function normalizePublicProductImageRecord(
  image: PublicProductImage,
  productId: string,
  index: number
): AdminProductImage {
  return {
    id: image.id ?? `${productId}-${index}`,
    product: image.product ?? productId,
    image: toAbsoluteUrl(image.image) ?? image.image ?? "",
    alt_text: image.alt_text ?? "",
    is_primary: Boolean(image.is_primary),
    is_active: image.is_active ?? true,
    created_at: image.created_at,
    updated_at: image.updated_at,
  };
}

function extractProductImagesFromRecord(product: PublicProductRecord) {
  const images = (product.images ?? []).map((image, index) =>
    normalizePublicProductImageRecord(image, product.id, index)
  );

  if (product.primary_image && typeof product.primary_image === "object") {
    const primaryImage = normalizePublicProductImageRecord(
      {
        ...product.primary_image,
        is_primary: product.primary_image.is_primary ?? true,
      },
      product.id,
      0
    );

    if (!images.some((image) => image.id === primaryImage.id)) {
      images.unshift(primaryImage);
    }
  }

  return images.map(normalizeAdminProductImage);
}

function getPrimaryProductImage(product: PublicProductRecord) {
  const nestedImages = extractProductImagesFromRecord(product);
  const primaryFromNested = nestedImages.find((image) => image.is_primary)?.image ?? nestedImages[0]?.image;

  return (
    primaryFromNested ??
    readImageUrl(product.primary_image) ??
    readImageUrl(product.image) ??
    readImageUrl(product.image_url) ??
    readImageUrl(product.thumbnail) ??
    null
  );
}

function normalizePublicProduct(product: PublicProductRecord): ProductListItem {
  const categoryName =
    product.category_name ||
    (product.category && typeof product.category === "object" ? product.category.name : undefined);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compare_at_price: product.compare_at_price ?? null,
    currency: product.currency ?? "FCFA",
    stock_status:
      product.stock_status ??
      (typeof product.is_in_stock === "string" ? product.is_in_stock : undefined) ??
      ((product.stock ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK"),
    category_name: categoryName,
    primary_image: toAbsoluteUrl(getPrimaryProductImage(product)),
    avg_rating: Number(product.note_produit ?? product.avg_rating ?? 0),
    review_count: product.count_ratings ?? product.review_count ?? 0,
    note_produit: product.note_produit,
    count_ratings: product.count_ratings,
    count_favorites: product.count_favorites,
    is_featured: product.is_featured ?? Boolean(product.is_top),
    is_boosted: product.is_boosted ?? false,
    labels: product.labels ?? [],
  };
}

function mapPublicProductToAdminProduct(product: PublicProductRecord): AdminCatalogProduct {
  const categoryName =
    product.category_name ||
    (product.category && typeof product.category === "object" ? product.category.name : undefined);
  const images = extractProductImagesFromRecord(product);
  const primaryImage = toAbsoluteUrl(getPrimaryProductImage(product));
  const stock = product.stock ?? 0;
  const stockStatus =
    typeof product.is_in_stock === "string"
      ? product.is_in_stock
      : stock > 0
        ? "IN_STOCK"
        : "OUT_OF_STOCK";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? product.slug,
    description: product.description,
    product_type: product.product_type ?? "RAW",
    price: product.price,
    stock,
    weight_grams: 0,
    is_in_stock: product.stock_status ?? stockStatus,
    is_top: product.is_top,
    category: categoryName ?? null,
    primary_image: primaryImage,
    image: primaryImage,
    image_url: primaryImage,
    thumbnail: primaryImage,
    images,
    note_produit: product.note_produit,
    count_ratings: product.count_ratings,
    count_favorites: product.count_favorites,
  };
}

async function getPublicCatalogProductsAsAdmin(limit = 200) {
  const payload = await getFirstWorkingPayload<PublicProductRecord[] | Paginated<PublicProductRecord>>([
    `/api/v1/catalog/products/?page_size=${limit}`,
    `/api/catalog/products/?page_size=${limit}`,
    `/products/?page_size=${limit}`,
  ]);

  return extractCollection<PublicProductRecord>(payload).map((product) =>
    normalizeAdminProduct(mapPublicProductToAdminProduct(product))
  );
}

function flattenCategories(categories: PublicCategory[]): PublicCategory[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ]);
}

function buildCategoryTree(categories: PublicCategory[]): PublicCategory[] {
  const nodes = categories.map((category) => ({
    ...category,
    image: toAbsoluteUrl(category.image),
    children: Array.isArray(category.children) ? category.children : [],
  }));

  const hasNestedChildren = nodes.some(
    (category) => Array.isArray(category.children) && category.children.length > 0
  );

  if (hasNestedChildren) {
    return nodes.map((category) => ({
      ...category,
      children: category.children?.length ? category.children : undefined,
    }));
  }

  const byId = new Map<string, PublicCategory>();
  for (const category of nodes) {
    byId.set(category.id, { ...category, children: [] });
  }

  const roots: PublicCategory[] = [];
  for (const category of byId.values()) {
    if (category.parent && byId.has(category.parent)) {
      byId.get(category.parent)!.children!.push(category);
    } else {
      roots.push(category);
    }
  }

  const prune = (items: PublicCategory[]): PublicCategory[] =>
    items.map((item) => ({
      ...item,
      children: item.children?.length ? prune(item.children) : undefined,
    }));

  return prune(roots);
}

export async function getPublicCategories() {
  const payload = await fetchJson<PublicCategory[] | Paginated<PublicCategory>>(
    "/api/v1/catalog/categories/"
  );

  return buildCategoryTree(extractCollection<PublicCategory>(payload));
}

export async function getCategoryById(id: string) {
  const category = await fetchJson<PublicCategory>(`/api/v1/catalog/categories/${id}/`);
  return {
    ...category,
    image: toAbsoluteUrl(category.image),
  };
}

export async function getPublicProducts(limit = 8) {
  const payload = await getFirstWorkingPayload<PublicProductRecord[] | Paginated<PublicProductRecord>>([
    `/api/v1/catalog/products/?page_size=${limit}`,
    `/api/catalog/products/?page_size=${limit}`,
    `/products/?page_size=${limit}`,
  ]);

  return extractCollection<PublicProductRecord>(payload).map(normalizePublicProduct);
}

export async function getProducts(filters?: ProductFilters) {
  const query = buildQueryString(filters);
  const payload = await fetchJson<PublicProductRecord[] | Paginated<PublicProductRecord>>(
    `/api/v1/catalog/products/${query}`
  );

  const results = extractCollection<PublicProductRecord>(payload).map(normalizePublicProduct);

  if (Array.isArray(payload)) {
    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  }

  return {
    count: payload.count ?? results.length,
    next: payload.next ?? null,
    previous: payload.previous ?? null,
    results,
  };
}

function getProductDemandScore(product: ProductListItem) {
  return (
    (product.count_favorites ?? 0) * 3 +
    (product.count_ratings ?? 0) * 2 +
    Number(product.avg_rating ?? product.note_produit ?? 0) * 10
  );
}

export async function getTrendingProducts(limit = 4) {
  const topResponse = await getProducts({ is_top: true, page_size: limit });
  const topProducts = topResponse.results;
  const seenIds = new Set(topProducts.map((product) => product.id));

  if (topProducts.length >= limit) {
    return topProducts.slice(0, limit);
  }

  const catalogResponse = await getProducts({ page_size: Math.max(limit * 5, 20) });
  const fallbackProducts = catalogResponse.results
    .filter((product) => !seenIds.has(product.id))
    .sort((left, right) => getProductDemandScore(right) - getProductDemandScore(left));

  return [...topProducts, ...fallbackProducts].slice(0, limit);
}

export async function searchProducts(query: string, page = 1) {
  return getProducts({ search: query, page, page_size: 100 });
}

export async function getCategories() {
  return flattenCategories(await getPublicCategories());
}

export async function getActivePromoCodes() {
  const payload = await fetchJson<PublicPromoCode[] | Paginated<PublicPromoCode>>(
    "/api/v1/promotions/codes-promo-actifs/"
  );
  return extractCollection<PublicPromoCode>(payload).map((promo) => ({
    ...promo,
    applicable_product_labels: promo.applicable_product_labels?.map((product) => ({
      ...product,
      image: toAbsoluteUrl(product.image) ?? null,
    })),
  }));
}

export async function getActiveBanners(type?: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const payload = await fetchJson<PublicBanner[] | Paginated<PublicBanner>>(
    `/api/v1/promotions/recommendations-actives/${query}`
  );
  return extractCollection<PublicBanner>(payload).map((banner) => ({
    ...banner,
    image_url: toAbsoluteUrl(banner.image_url) ?? "",
  }));
}

export async function getActiveFlashSales() {
  const payload = await fetchJson<PublicFlashSale[] | Paginated<PublicFlashSale>>(
    "/api/v1/promotions/soldes-actifs/"
  );
  return extractCollection<PublicFlashSale>(payload).map((sale) => ({
    ...sale,
    product_image: toAbsoluteUrl(sale.product_image) ?? "",
  }));
}

/** Produits en promotion = ventes flash actives configurees dans l'admin. */
export async function getPromoProducts() {
  return getActiveFlashSales();
}

export async function getAdminPromoCodes(token: string) {
  const payload = await fetchJson<AdminPromoCode[] | Paginated<AdminPromoCode>>(
    "/api/v1/promotions/admin/codes-promo/",
    { headers: authHeaders(token) }
  );

  return extractCollection<AdminPromoCode>(payload);
}

export type AdminPromoCodePayload = {
  is_active: boolean;
  code: string;
  description: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  starts_at?: string;
  expires_at?: string | null;
  applicable_products?: string[];
  applicable_categories?: string[];
  restricted_to_tiers?: string[];
  restricted_to_users?: number[];
};

export async function createAdminPromoCode(token: string, payload: AdminPromoCodePayload) {
  return fetchMutation<AdminPromoCode>("/api/v1/promotions/admin/codes-promo/", {
    method: "POST",
    body: JSON.stringify({
      applicable_products: [],
      applicable_categories: [],
      restricted_to_tiers: [],
      restricted_to_users: [],
      ...payload,
    }),
    headers: authHeaders(token),
  });
}

export type AdminFlashSale = {
  id: string;
  is_active: boolean;
  sale_price: string;
  original_price: string;
  quota_stock_limit: number | null;
  product_sold_count: number;
  starts_at: string;
  ends_at: string;
  product: string;
  variant?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminFlashSalePayload = {
  is_active?: boolean;
  sale_price: string;
  quota_stock_limit?: number | null;
  starts_at?: string;
  ends_at: string;
  product: string;
  variant?: string | null;
};

export type AdminBanner = {
  id: string;
  is_active: boolean;
  title: string;
  subtitle?: string;
  image: string;
  cta_label?: string;
  cta_url?: string;
  banner_type?: "carousel" | "popup" | "hero" | "side_banner";
  position?: number;
  starts_at?: string;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminBannerPayload = {
  is_active?: boolean;
  title: string;
  subtitle?: string;
  image: string;
  cta_label?: string;
  cta_url?: string;
  banner_type?: "carousel" | "popup" | "hero" | "side_banner";
  position?: number;
  starts_at?: string;
  ends_at?: string | null;
};

export async function getAdminFlashSales(token: string) {
  const payload = await fetchJson<AdminFlashSale[] | Paginated<AdminFlashSale>>(
    "/api/v1/promotions/admin/ventes-solde/",
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminFlashSale>(payload);
}

export async function getAdminFlashSaleById(token: string, id: string) {
  return fetchJson<AdminFlashSale>(`/api/v1/promotions/admin/ventes-solde/${id}/`, {
    headers: authHeaders(token),
  });
}

export async function createAdminFlashSale(token: string, payload: AdminFlashSalePayload) {
  return fetchMutation<AdminFlashSale>("/api/v1/promotions/admin/ventes-solde/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function updateAdminFlashSale(
  token: string,
  id: string,
  payload: AdminFlashSalePayload
) {
  return fetchMutation<AdminFlashSale>(`/api/v1/promotions/admin/ventes-solde/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function patchAdminFlashSale(
  token: string,
  id: string,
  payload: Partial<AdminFlashSalePayload> & { is_active?: boolean }
) {
  return fetchMutation<AdminFlashSale>(`/api/v1/promotions/admin/ventes-solde/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function deleteAdminFlashSale(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/promotions/admin/ventes-solde/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function getAdminPromoCodeById(token: string, id: string) {
  return fetchJson<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`, {
    headers: authHeaders(token),
  });
}

export async function updateAdminPromoCode(
  token: string,
  id: string,
  payload: AdminPromoCodePayload
) {
  return fetchMutation<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`, {
    method: "PUT",
    body: JSON.stringify({
      applicable_products: [],
      applicable_categories: [],
      restricted_to_tiers: [],
      restricted_to_users: [],
      ...payload,
    }),
    headers: authHeaders(token),
  });
}

export async function patchAdminPromoCode(
  token: string,
  id: string,
  payload: Partial<AdminPromoCodePayload>
) {
  return fetchMutation<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function deleteAdminPromoCode(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/promotions/admin/codes-promo/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function deactivateExpiredPromoCodes(token: string) {
  return fetchMutation<{ deactivated: number }>(
    "/api/v1/promotions/admin/codes-promo/deactivate_expired/",
    {
      method: "POST",
      body: JSON.stringify({}),
      headers: authHeaders(token),
    }
  );
}

export async function getAdminBanners(token: string) {
  const payload = await fetchJson<AdminBanner[] | Paginated<AdminBanner>>(
    "/api/v1/promotions/admin/recommendations/",
    { headers: authHeaders(token) }
  );

  return extractCollection<AdminBanner>(payload).map((banner) => ({
    ...banner,
    image: toAbsoluteUrl(banner.image) ?? banner.image,
  }));
}

export async function getAdminBannerById(token: string, id: string) {
  const banner = await fetchJson<AdminBanner>(`/api/v1/promotions/admin/recommendations/${id}/`, {
    headers: authHeaders(token),
  });

  return {
    ...banner,
    image: toAbsoluteUrl(banner.image) ?? banner.image,
  };
}

export async function createAdminBanner(token: string, payload: AdminBannerPayload) {
  const banner = await fetchMutation<AdminBanner>("/api/v1/promotions/admin/recommendations/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });

  return {
    ...banner,
    image: toAbsoluteUrl(banner.image) ?? banner.image,
  };
}

export async function updateAdminBanner(token: string, id: string, payload: AdminBannerPayload) {
  const banner = await fetchMutation<AdminBanner>(
    `/api/v1/promotions/admin/recommendations/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: authHeaders(token),
    }
  );

  return {
    ...banner,
    image: toAbsoluteUrl(banner.image) ?? banner.image,
  };
}

export async function patchAdminBanner(
  token: string,
  id: string,
  payload: Partial<AdminBannerPayload>
) {
  const banner = await fetchMutation<AdminBanner>(
    `/api/v1/promotions/admin/recommendations/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: authHeaders(token),
    }
  );

  return {
    ...banner,
    image: toAbsoluteUrl(banner.image) ?? banner.image,
  };
}

export async function deleteAdminBanner(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/promotions/admin/recommendations/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function getAdminCategories(token: string) {
  const headers = authHeaders(token);

  try {
    const payload = await fetchJson<AdminCategory[]>(
      "/api/v1/catalog/admin/categories/",
      { headers }
    );

    return extractCollection<AdminCategory>(payload).map((category) => ({
      ...category,
      image: toAbsoluteUrl(category.image),
    }));
  } catch (error) {
    console.warn("Admin categories indisponibles, fallback catalogue public.", error);

    const payload = await fetchJson<PublicCategory[]>("/api/v1/catalog/categories/");
    return extractCollection<PublicCategory>(payload).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: toAbsoluteUrl(category.image),
      children: category.children ?? null,
    }));
  }
}

export async function getAdminProductVariants(token?: string | null) {
  if (!token) {
    return [];
  }

  try {
    const payload = await fetchJson<AdminProductVariant[] | Paginated<AdminProductVariant>>(
      "/api/v1/catalog/admin/product-variants/",
      {
        headers: authHeaders(token),
      }
    );

    return extractCollection<AdminProductVariant>(payload);
  } catch (error) {
    console.warn("Admin product variants indisponibles.", error);
    return [];
  }
}

export async function getAdminProducts(token?: string | null) {
  if (token) {
    try {
      const payload = await fetchJson<AdminCatalogProduct[] | Paginated<AdminCatalogProduct>>(
        "/api/v1/catalog/admin/products/",
        {
          headers: authHeaders(token),
        }
      );

      return extractCollection<AdminCatalogProduct>(payload).map((product) =>
        normalizeAdminProduct(product)
      );
    } catch (error) {
      console.warn("Admin products indisponibles, fallback catalogue public.", error);
    }
  }

  return getPublicCatalogProductsAsAdmin();
}

export async function createAdminCategory(token: string, payload: AdminCategoryPayload) {
  return fetchMutation<AdminCategory>("/api/v1/catalog/admin/categories/", {
    method: "POST",
    body: buildAdminCategoryBody(payload),
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function createAdminProduct(token: string, payload: AdminCatalogProductPayload) {
  const sanitizedPayload = sanitizeAdminProductPayload(payload);

  const product = await fetchMutation<AdminCatalogProduct>(
    "/api/v1/catalog/admin/products/",
    {
      method: "POST",
      body: JSON.stringify(sanitizedPayload),
      headers: authHeaders(token),
    },
    { retries: 3 }
  );

  if (!product?.id) {
    throw new Error("Le backend n'a pas renvoye l'identifiant du produit cree.");
  }

  return normalizeAdminProduct(product);
}

export async function createAdminProductVariant(
  token: string,
  payload: AdminProductVariantPayload
) {
  const variant = await fetchMutation<AdminProductVariant>(
    "/api/v1/catalog/admin/product-variants/",
    {
      method: "POST",
      body: JSON.stringify(sanitizeAdminProductVariantPayload(payload)),
      headers: authHeaders(token),
    }
  );

  return variant;
}

export async function getAdminProductVariantById(token: string, id: string) {
  return fetchJson<AdminProductVariant>(`/api/v1/catalog/admin/product-variants/${id}/`, {
    headers: authHeaders(token),
  });
}

export async function updateAdminProductVariant(
  token: string,
  id: string,
  payload: AdminProductVariantPayload
) {
  return fetchMutation<AdminProductVariant>(
    `/api/v1/catalog/admin/product-variants/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(sanitizeAdminProductVariantPayload(payload)),
      headers: authHeaders(token),
    }
  );
}

export async function patchAdminProductVariant(
  token: string,
  id: string,
  payload: AdminProductVariantPatchPayload
) {
  return fetchMutation<AdminProductVariant>(
    `/api/v1/catalog/admin/product-variants/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(sanitizeAdminProductVariantPayload(payload)),
      headers: authHeaders(token),
    }
  );
}

export async function deleteAdminProductVariant(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/catalog/admin/product-variants/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function createAdminProductImage(token: string, payload: AdminProductImagePayload) {
  const useJson = typeof payload.image === "string";
  const image = await fetchMutation<AdminProductImage>(
    "/api/v1/catalog/admin/product-images/",
    {
      method: "POST",
      body: useJson
        ? buildProductImageJsonBody(payload)
        : buildProductImageFormData(payload),
      headers: authHeaders(token),
    },
    { retries: 2 }
  );

  return normalizeAdminProductImage(image);
}

export async function getAdminProductImageById(token: string, id: string) {
  const image = await fetchJson<AdminProductImage>(
    `/api/v1/catalog/admin/product-images/${id}/`,
    {
      headers: authHeaders(token),
    }
  );

  return normalizeAdminProductImage(image);
}

export async function updateAdminProductImage(
  token: string,
  id: string,
  payload: AdminProductImagePayload
) {
  const useJson = typeof payload.image === "string";
  const image = await fetchMutation<AdminProductImage>(
    `/api/v1/catalog/admin/product-images/${id}/`,
    {
      method: "PUT",
      body: useJson
        ? buildProductImageJsonBody(payload)
        : buildProductImageFormData(payload),
      headers: authHeaders(token),
    }
  );

  return normalizeAdminProductImage(image);
}

export async function patchAdminProductImage(
  token: string,
  id: string,
  payload: AdminProductImagePatchPayload
) {
  const useJson = !(payload.image instanceof File);
  const image = await fetchMutation<AdminProductImage>(
    `/api/v1/catalog/admin/product-images/${id}/`,
    {
      method: "PATCH",
      body: useJson
        ? JSON.stringify(payload)
        : buildProductImageFormData(payload),
      headers: authHeaders(token),
    }
  );

  return normalizeAdminProductImage(image);
}

export async function deleteAdminProductImage(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/catalog/admin/product-images/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function getAdminProductImages(token?: string | null) {
  if (token) {
    try {
      const payload = await fetchJson<AdminProductImage[] | Paginated<AdminProductImage>>(
        "/api/v1/catalog/admin/product-images/",
        {
          headers: authHeaders(token),
        }
      );

      return extractCollection<AdminProductImage>(payload).map(normalizeAdminProductImage);
    } catch (error) {
      console.warn("Admin product images indisponibles, fallback depuis produits.", error);
    }
  }

  const products = await getPublicCatalogProductsAsAdmin();
  const images = products.flatMap((product) =>
    (product.images ?? []).map((image) =>
      normalizeAdminProductImage({
        ...image,
        product: image.product ?? product.id,
      })
    )
  );

  const uniqueImages = new Map<string, AdminProductImage>();
  for (const image of images) {
    uniqueImages.set(image.id, image);
  }

  return [...uniqueImages.values()];
}

export async function getAdminProductById(token: string, id: string) {
  const product = await fetchJson<AdminCatalogProduct>(
    `/api/v1/catalog/admin/products/${id}/`,
    {
      headers: authHeaders(token),
    }
  );

  return normalizeAdminProduct(product);
}

export async function updateAdminProduct(
  token: string,
  id: string,
  payload: AdminCatalogProductPayload
) {
  const sanitizedPayload = sanitizeAdminProductPayload(payload);

  const product = await fetchMutation<AdminCatalogProduct>(
    `/api/v1/catalog/admin/products/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(sanitizedPayload),
      headers: authHeaders(token),
    },
    { retries: 3 }
  );

  return normalizeAdminProduct(product, id);
}

export async function patchAdminProduct(
  token: string,
  id: string,
  payload: Partial<AdminCatalogProductPayload>
) {
  const product = await fetchMutation<AdminCatalogProduct>(
    `/api/v1/catalog/admin/products/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: authHeaders(token),
    }
  );

  return normalizeAdminProduct(product, id);
}

export async function deleteAdminProduct(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/catalog/admin/products/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function updateAdminCategory(
  token: string,
  id: string,
  payload: AdminCategoryPayload
) {
  const category = await fetchMutation<AdminCategory>(
    `/api/v1/catalog/admin/categories/${id}/`,
    {
      method: "PUT",
      body: buildAdminCategoryBody(payload),
      headers: authHeaders(token),
    }
  );

  return {
    ...category,
    image: toAbsoluteUrl(category.image),
  };
}

export async function deleteAdminCategory(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/catalog/admin/categories/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export type PublicProductDetail = AdminCatalogProduct;

export async function getProductById(id: string) {
  const product = await fetchJson<PublicProductDetail>(`/api/v1/catalog/products/${id}/`);
  return normalizeAdminProduct(product);
}

export async function getProductBySlug(slug: string) {
  try {
    return await getProductById(slug);
  } catch {
    const list = await getProducts({ search: slug, page_size: 100 });
    const match = list.results.find((product) => product.slug === slug);
    if (match) {
      return getProductById(match.id);
    }
    throw new Error(`Produit introuvable pour le slug "${slug}".`);
  }
}

export type ProductRating = {
  avg_rating?: number;
  review_count?: number;
  note_produit?: string;
  count_ratings?: number;
  count_favorites?: number;
  user_score?: number | null;
  distribution?: Record<string, number>;
};

export async function getProductRatings(productId: string, token?: string) {
  const product = await getProductById(productId);
  let user_score: number | null = null;

  if (token) {
    try {
      const myRatings = await getMyRatings(token);
      const mine = myRatings.find((rating) => rating.product_id === productId);
      user_score = mine?.score ?? null;
    } catch {
      user_score = null;
    }
  }

  return {
    note_produit: product.note_produit,
    avg_rating: Number(product.note_produit ?? 0),
    count_ratings: product.count_ratings,
    count_favorites: product.count_favorites,
    user_score,
  } satisfies ProductRating;
}

export type MyRating = {
  product_id: string;
  score: number;
};

export async function getMyRatings(token: string) {
  const payload = await fetchJson<MyRating[]>("/api/v1/catalog/notes-products/mes-notes/", {
    headers: authHeaders(token),
  });
  return extractCollection<MyRating>(payload);
}

export type RateProductResponse = {
  rated: boolean;
  user_score: number;
  note_produit: string;
  count_ratings: number;
  product_id: string;
  updated: boolean;
};

export async function rateProduct(token: string, productId: string, score: number) {
  return fetchMutation<RateProductResponse>("/api/v1/catalog/notes-products/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, score }),
    headers: authHeaders(token),
  });
}

export async function deleteProductRating(token: string, ratingId: string) {
  await fetchMutation<void>(`/api/v1/catalog/notes-products/delete/${ratingId}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export type ToggleFavoriteResponse = {
  favorited: boolean;
  count_favorites: number;
  product_id: string;
};

export type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string | null;
  is_in_stock: boolean;
  favorited_at: string;
  count_favorites: number;
};

export async function getMyFavorites(token: string) {
  const payload = await fetchJson<FavoriteProduct[]>("/api/v1/catalog/products/my-favorites/", {
    headers: authHeaders(token),
  });

  return extractCollection<FavoriteProduct>(payload).map((item) => ({
    ...item,
    image: toAbsoluteUrl(item.image),
  }));
}

export async function toggleFavorite(token: string, productId: string) {
  return fetchMutation<ToggleFavoriteResponse>("/api/v1/catalog/favorites-toggle/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
    headers: authHeaders(token),
  });
}

export async function deleteFavorite(token: string, favoriteId: string) {
  await fetchMutation<void>(`/api/v1/catalog/favorites-delete/${favoriteId}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export type OrderSummary = {
  id: string;
  reference: string;
  status: string;
  items_total: string;
  frais_livraison: string;
  total_final: string;
  discount_amount?: string;
  promo_code?: string | null;
  promo_type?: string | null;
  promo_value?: string | null;
  notes?: string | null;
  created_at: string;
};

export type OrderDetail = OrderSummary & {
  address_livraison: string;
  phone_livraison: string;
  city: string;
  country: string;
  discount_amount: string;
  tax_amount: string;
  notes: string;
  paid_at: string | null;
  updated_at: string;
  promo_code?: string | null;
  items: Array<{
    id: string;
    product: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
};

export type OrderFilters = {
  status?: string;
  reference?: string;
  created_after?: string;
  created_before?: string;
};

export function formatOrderStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  const labels: Record<string, string> = {
    pending_payment: "En attente de paiement",
    paid: "Payee",
    processing: "En preparation",
    shipped: "Expediee",
    delivered: "Livree",
    cancelled: "Annulee",
    canceled: "Annulee",
    refunded: "Remboursee",
  };

  return labels[normalized] ?? status.replace(/_/g, " ");
}

export function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readOrderAmount(value: unknown): number {
  if (value == null || value === "") {
    return 0;
  }

  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveOrderDiscountAmount(order: Record<string, unknown>): number {
  const explicit = readOrderAmount(
    order.discount_amount ?? order.montant_reduction ?? order.reduction_amount
  );
  if (explicit > 0) {
    return explicit;
  }

  const itemsTotal = readOrderAmount(order.items_total);
  const shipping = readOrderAmount(order.frais_livraison);
  const tax = readOrderAmount(order.tax_amount);
  const totalFinal = readOrderAmount(order.total_final);
  const computed = itemsTotal + shipping + tax - totalFinal;

  if (computed > 0.01) {
    return Math.round(computed * 100) / 100;
  }

  const promoType = String(order.promo_type ?? order.promotion_type ?? "");
  const promoValue = readOrderAmount(order.promo_value ?? order.promotion_value);
  if (promoType === "percentage" && promoValue > 0 && itemsTotal > 0) {
    return Math.round(itemsTotal * promoValue) / 100;
  }
  if (promoType === "fixed_amount" && promoValue > 0) {
    return Math.min(promoValue, itemsTotal);
  }

  return 0;
}

function normalizeOrderRecord<T extends Record<string, unknown>>(order: T): T & OrderDetail {
  const discount = resolveOrderDiscountAmount(order);

  const normalized = {
    ...order,
    discount_amount: String(discount),
    promo_type: (order.promo_type ?? order.promotion_type ?? null) as string | null,
    promo_value: (order.promo_value ?? order.promotion_value ?? null) as string | null,
    promo_code: (order.promo_code ??
      order.code_promo ??
      order.coupon_code ??
      order.applied_promo_code ??
      null) as string | null,
  } as T & OrderDetail;

  return mergeOrderWithPromoMeta(normalized);
}

export async function getOrders(token: string, filters?: OrderFilters) {
  const query = buildQueryString(filters);
  const endpoint = query
    ? `/api/v1/commandes/mes-commandes/${query}`
    : "/api/v1/commandes/mes-commandes/";

  const payload = await fetchJson<OrderSummary[] | Paginated<OrderSummary>>(endpoint, {
    headers: authHeaders(token),
  });

  return extractCollection<OrderSummary>(payload).map((order) =>
    normalizeOrderRecord(order as Record<string, unknown>)
  );
}

export async function getOrderByReference(token: string, reference: string) {
  const order = await fetchJson<OrderDetail>(`/api/v1/commandes/mes-commandes/${reference}/`, {
    headers: authHeaders(token),
  });
  return normalizeOrderRecord(order as Record<string, unknown>);
}

export async function cancelOrder(token: string, reference: string) {
  return fetchMutation<void>(`/api/v1/commandes/mes-commandes/${reference}/cancel/`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export type OrderHistoryEntry = {
  id: string;
  old_status: string;
  new_status: string;
  comment: string;
  created_at: string;
  changed_by_email: string;
};

export async function getOrderHistory(token: string, reference: string) {
  const payload = await fetchJson<OrderHistoryEntry[]>(
    `/api/v1/commandes/mes-commandes/${reference}/historique/`,
    { headers: authHeaders(token) }
  );
  return extractCollection<OrderHistoryEntry>(payload);
}

export async function getAdminOrders(token: string, filters?: OrderFilters) {
  const query = buildQueryString(filters);
  const payload = await fetchJson<OrderSummary[]>(
    `/api/v1/commandes/admin/all-commandes/${query}`,
    { headers: authHeaders(token) }
  );
  return extractCollection<OrderSummary>(payload).map((order) =>
    normalizeOrderRecord(order as Record<string, unknown>)
  );
}

export async function getAdminOrderByReference(token: string, reference: string) {
  const order = await fetchJson<OrderDetail>(
    `/api/v1/commandes/admin/commandes/${reference}/`,
    { headers: authHeaders(token) }
  );
  return normalizeOrderRecord(order as Record<string, unknown>);
}

export async function updateAdminOrderStatus(
  token: string,
  reference: string,
  status: string,
  comment?: string
) {
  return fetchMutation<{ status: string; comment?: string }>(
    `/api/v1/commandes/admin/commandes/${reference}/status/`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, comment }),
      headers: authHeaders(token),
    }
  );
}

export type CheckoutPayload = {
  address_livraison: string;
  phone_livraison: string;
  city: string;
  country: string;
  notes?: string;
  promo_code?: string | null;
  promo_discount?: number;
  promo_type?: string | null;
  promo_value?: string | null;
  promo_label?: string | null;
  free_shipping?: boolean;
  shipping_fee?: number;
  items: Array<{ product_id: string; quantity: number; variant_id?: string | null }>;
};

export type CheckoutResponse = {
  id: string;
  reference: string;
  status: string;
  address_livraison: string;
  phone_livraison: string;
  city: string;
  country: string;
  items_total: string;
  frais_livraison: string;
  discount_amount: string;
  tax_amount: string;
  total_final: string;
  notes?: string;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: Array<{
    id: string;
    product: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
};

export async function checkoutOrder(token: string, payload: CheckoutPayload) {
  const sanitizedItems = payload.items
    .filter((item) => item.product_id?.trim() && item.quantity > 0)
    .map((item) => ({
      product_id: item.product_id.trim(),
      quantity: Math.max(1, Math.floor(item.quantity)),
      ...(item.variant_id ? { variant_id: item.variant_id } : {}),
    }));

  if (sanitizedItems.length === 0) {
    throw new Error("Aucun article valide dans le panier.");
  }

  const promoCode = payload.promo_code?.trim().toUpperCase() ?? "";
  const promoDiscount = payload.promo_discount ?? 0;
  const freeShipping = Boolean(payload.free_shipping);
  const shippingFee = payload.shipping_fee ?? 0;
  const productDiscount = freeShipping ? 0 : promoDiscount;

  return fetchMutation<CheckoutResponse>(
    "/api/v1/commandes/validate-commandes/",
    {
      method: "POST",
      body: JSON.stringify({
        address_livraison: payload.address_livraison.trim().slice(0, 255),
        phone_livraison: payload.phone_livraison.trim().slice(0, 30),
        city: payload.city.trim().slice(0, 100),
        country: payload.country.trim().slice(0, 100),
        notes: payload.notes?.trim() || "",
        shipping_fee: shippingFee > 0 ? shippingFee.toFixed(2) : undefined,
        free_shipping: freeShipping || undefined,
        promo_type: payload.promo_type ?? undefined,
        ...(promoCode
          ? {
              promo_code: promoCode,
              code_promo: promoCode,
              code: promoCode,
              discount_amount:
                productDiscount > 0 ? productDiscount.toFixed(2) : undefined,
            }
          : {}),
        items: sanitizedItems,
      }),
      headers: authHeaders(token),
    }
  );
}

export type WalletBalance = {
  id: string;
  balance: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getWalletBalance(token: string) {
  return fetchJson<WalletBalance>("/api/v1/paiements/my-wallet/", {
    headers: authHeaders(token),
  });
}

export type WalletTransaction = {
  id: string;
  transaction_type: string;
  amount: string;
  reference: string;
  order: string | null;
  status: string;
  created_at: string;
};

export async function getWalletTransactions(token: string) {
  const payload = await fetchJson<WalletTransaction[]>(
    "/api/v1/paiements/wallet/historique-transactions/",
    { headers: authHeaders(token) }
  );
  return extractCollection<WalletTransaction>(payload);
}

export type ValidatePromoResponse = {
  valid?: boolean;
  is_valid?: boolean;
  code?: string;
  type?: string;
  value?: string;
  discount_amount?: string;
  montant_reduction?: string;
  reduction_amount?: string;
  reduction?: string;
  discount?: string;
  free_shipping?: boolean;
  shipping_waiver?: string;
  description?: string;
  error_code?: string;
  detail?: string;
};

export type ValidatePromoCartItem = {
  product_id: string;
  quantity: number;
  price: string;
  category_id?: string | null;
};

export async function validatePromoCode(
  token: string,
  code: string,
  cartTotal: string,
  cartItems?: ValidatePromoCartItem[],
  shippingFee?: string
) {
  return fetchMutation<ValidatePromoResponse>("/api/v1/promotions/codes-promo/validate/", {
    method: "POST",
    body: JSON.stringify({
      code,
      cart_total: cartTotal,
      ...(shippingFee ? { shipping_fee: shippingFee } : {}),
      ...(cartItems?.length ? { cart_items: cartItems } : {}),
    }),
    headers: authHeaders(token),
  });
}

// --- Admin wallet & payments ---

export type AdminWallet = {
  id: string;
  user_id: number;
  user_email: string;
  user_name: string;
  balance: string;
  status: "active" | "suspendu" | "blocked" | "inactif";
  created_at: string;
  updated_at: string;
};

export type AdminTransaction = {
  id: string;
  type_label: string;
  status_label: string;
  provider_label: string;
  amount: string;
  reference_externe: string;
  order: string | null;
  order_reference: string;
  created_at: string;
};

export type AdminWithdrawPayload = {
  amount: string;
  phone_number: string;
  description?: string;
};

export async function getAdminAllWallets(token: string) {
  const payload = await fetchJson<AdminWallet[] | Paginated<AdminWallet>>(
    "/api/v1/paiements/admin/all-wallets/",
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminWallet>(payload);
}

export async function getAdminAllTransactions(token: string) {
  const payload = await fetchJson<AdminTransaction[]>(
    "/api/v1/paiements/admin/all-transactions/",
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminTransaction>(payload);
}

export async function updateAdminWalletStatus(
  token: string,
  walletId: string,
  status: AdminWallet["status"]
) {
  return fetchMutation<AdminWallet>(`/api/v1/paiements/admin/wallets/${walletId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: authHeaders(token),
  });
}

export async function adminWithdrawFunds(token: string, payload: AdminWithdrawPayload) {
  return fetchMutation<Record<string, unknown>>("/api/v1/paiements/admin/retrait-fonds/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

// --- Admin loyalty ---

export type LoyaltyTier = {
  id: string;
  name: string;
  min_points: number;
  min_solde: string;
  discount_percent: string;
};

export type AdminLoyaltyProfile = {
  id: string;
  tier?: LoyaltyTier | null;
  tier_name?: string;
  points_balance: number;
  total_points_earned: number;
  total_solde: string;
  next_tier?: string | null;
  created_at?: string;
  user_email?: string;
  user_name?: string;
};

export type AdminAdjustPointsPayload = {
  user_id: string;
  points: number;
  reason: string;
};

export type AdminLoyaltyProfilePayload = Record<string, unknown>;

export async function getAdminLoyaltyProfiles(token: string) {
  const payload = await fetchJson<AdminLoyaltyProfile[] | Paginated<AdminLoyaltyProfile>>(
    "/api/v1/fidelites/admin/profiles/",
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminLoyaltyProfile>(payload);
}

export async function getLoyaltyTiers(token: string) {
  const payload = await fetchJson<LoyaltyTier[] | Paginated<LoyaltyTier>>(
    "/api/v1/fidelites/liste-des-grades/",
    { headers: authHeaders(token) }
  );
  return extractCollection<LoyaltyTier>(payload);
}

export async function createAdminLoyaltyProfile(
  token: string,
  payload: AdminLoyaltyProfilePayload
) {
  return fetchMutation<AdminLoyaltyProfile>("/api/v1/fidelites/admin/profiles/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function patchAdminLoyaltyProfile(
  token: string,
  id: string,
  payload: AdminLoyaltyProfilePayload
) {
  return fetchMutation<AdminLoyaltyProfile>(`/api/v1/fidelites/admin/profiles/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function deleteAdminLoyaltyProfile(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/fidelites/admin/profiles/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function adjustAdminLoyaltyPoints(
  token: string,
  payload: AdminAdjustPointsPayload
) {
  return fetchMutation<{
    success: boolean;
    user_email?: string;
    points_adjusted?: number;
    new_balance?: number;
  }>("/api/v1/fidelites/admin/profiles/adjust_points/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export type CustomerLoyaltyProfile = {
  id: string;
  tier_name?: string;
  points_balance?: number;
  total_points_earned?: number;
  total_solde?: string;
  next_tier?: string | null;
  tier?: LoyaltyTier | null;
};

export type LoyaltyEvent = {
  id: string;
  points_delta: number;
  new_points_balance_after: number;
  reason: string;
  reason_display: string;
  description: string;
  created_at: string;
};

export type AdminTierPayload = {
  name: string;
  min_points?: number;
  min_solde?: string;
  discount_percent?: string;
};

export async function getMyLoyaltyProfile(token: string) {
  return fetchJson<CustomerLoyaltyProfile>("/api/v1/fidelites/mon-profil-fidelite/", {
    headers: authHeaders(token),
  });
}

export async function getLoyaltyEvents(token: string) {
  const payload = await fetchJson<LoyaltyEvent[]>("/api/v1/fidelites/historique-utilisation/", {
    headers: authHeaders(token),
  });
  return extractCollection<LoyaltyEvent>(payload);
}

export async function redeemLoyaltyPoints(
  token: string,
  payload: { points_to_spend: number; order_id: string }
) {
  return fetchMutation<{
    success: boolean;
    points_spent: number;
    discount_amount: string;
    order_total_after: string;
  }>("/api/v1/fidelites/depenser-mes-points/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function getPublicLoyaltyTiers() {
  const payload = await fetchJson<LoyaltyTier[]>("/api/v1/fidelites/liste-des-grades/");
  return extractCollection<LoyaltyTier>(payload);
}

export async function getAdminLoyaltyTiers(token: string) {
  const payload = await fetchJson<LoyaltyTier[] | Paginated<LoyaltyTier>>(
    "/api/v1/fidelites/admin/tiers/",
    { headers: authHeaders(token) }
  );
  return extractCollection<LoyaltyTier>(payload);
}

export async function createAdminLoyaltyTier(token: string, payload: AdminTierPayload) {
  return fetchMutation<LoyaltyTier>("/api/v1/fidelites/admin/tiers/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function updateAdminLoyaltyTier(
  token: string,
  id: string,
  payload: AdminTierPayload
) {
  return fetchMutation<LoyaltyTier>(`/api/v1/fidelites/admin/tiers/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function patchAdminLoyaltyTier(
  token: string,
  id: string,
  payload: Partial<AdminTierPayload>
) {
  return fetchMutation<LoyaltyTier>(`/api/v1/fidelites/admin/tiers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function deleteAdminLoyaltyTier(token: string, id: string) {
  await fetchMutation<void>(`/api/v1/fidelites/admin/tiers/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
