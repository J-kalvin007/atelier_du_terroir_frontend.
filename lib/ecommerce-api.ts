import { parseApiErrorPayload } from "@/lib/utils";

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

export type PublicPromoCode = {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  type_display?: string;
  value: string;
  starts_at?: string;
  expires_at?: string | null;
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
  slug: string;
  description: string;
  image?: File | string;
};

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
  image: File;
  alt_text: string;
  is_primary: boolean;
  is_active?: boolean;
};

export type AdminProductVariant = {
  id: string;
  product?: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  weight_grams: number;
  is_active?: boolean;
  is_in_stock?: string;
};

export type AdminProductVariantPayload = {
  product: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  weight_grams: number;
  is_active?: boolean;
};

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
  related_products?: Array<{
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
  }>;
  note_produit?: string;
  count_ratings?: number;
  count_favorites?: number;
};

export type AdminCatalogProductPayload = {
  category: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  product_type: string;
  price: string;
  stock: number;
  weight_grams: number;
  seo_title: string;
  seo_description: string;
  is_top: boolean;
  related_products: string[];
  images?: Array<{
    image: string;
    alt_text: string;
    is_primary: boolean;
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
  image?: string | null;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
};

type PublicProductRecord = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price?: string | null;
  currency?: string;
  stock_status?: string;
  is_in_stock?: string;
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
  primary_image?: string | null;
  image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  images?: PublicProductImage[];
  category?: PublicCategory | string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Les appels /api/v1 passent par le proxy Next.js (evite CORS et ngrok cote navigateur).
  if (path.startsWith("/api/v1/")) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
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
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!API_BASE_URL) {
    return value;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${value.startsWith("/") ? value : `/${value}`}`;
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

function readFetchErrorMessage(text: string, status: number, path: string) {
  if (!text.trim()) {
    return `Erreur API ${status} sur ${path}`;
  }

  try {
    return parseApiErrorPayload(JSON.parse(text), text.trim());
  } catch {
    return text.trim();
  }
}

function sanitizeProductSlug(value: string, fallbackName: string) {
  const source = value.trim() || fallbackName.trim().toLowerCase();
  return source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function sanitizeDecimalPrice(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(/,/g, ".");
  const match = normalized.match(/^-?\d{0,10}(?:\.\d{0,2})?/);
  return match?.[0] || "0";
}

function sanitizeAdminProductPayload(payload: AdminCatalogProductPayload): AdminCatalogProductPayload {
  return {
    ...payload,
    category: payload.category?.trim() || null,
    name: payload.name.trim().slice(0, 255),
    slug: sanitizeProductSlug(payload.slug, payload.name),
    sku: payload.sku.trim().slice(0, 100),
    description: payload.description?.trim() || "",
    product_type: payload.product_type || "RAW",
    price: sanitizeDecimalPrice(payload.price),
    stock: Math.max(0, Math.min(2147483647, Number(payload.stock) || 0)),
    weight_grams: Math.max(0, Math.min(2147483647, Number(payload.weight_grams) || 0)),
    seo_title: payload.seo_title?.trim().slice(0, 255) || "",
    seo_description: payload.seo_description?.trim() || "",
    is_top: Boolean(payload.is_top),
    related_products: payload.related_products ?? [],
  };
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

async function fetchMutation<T>(path: string, init: RequestInit) {
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
    throw new Error(readFetchErrorMessage(text, response.status, path));
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

function normalizeAdminProduct(product: AdminCatalogProduct) {
  return {
    ...product,
    image: toAbsoluteUrl(product.image),
    primary_image: toAbsoluteUrl(product.primary_image),
    image_url: toAbsoluteUrl(product.image_url),
    thumbnail: toAbsoluteUrl(product.thumbnail),
    images: (product.images ?? []).map(normalizeAdminProductImage),
  };
}

function buildAdminCategoryBody(payload: AdminCategoryPayload) {
  const hasFile = typeof File !== "undefined" && payload.image instanceof File;

  if (!hasFile) {
    return JSON.stringify({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      ...(typeof payload.image === "string" && payload.image.trim()
        ? { image: payload.image.trim() }
        : {}),
    });
  }

  const formData = new FormData();
  const imageFile = payload.image as File;
  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  formData.append("description", payload.description);
  formData.append("image", imageFile, imageFile.name);
  return formData;
}

function getPrimaryProductImage(product: PublicProductRecord) {
  return (
    product.images?.find((image) => image.is_primary)?.image ??
    product.images?.[0]?.image ??
    product.primary_image ??
    product.image ??
    product.image_url ??
    product.thumbnail ??
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
    stock_status: product.stock_status ?? product.is_in_stock ?? "IN_STOCK",
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

function flattenCategories(categories: PublicCategory[]): PublicCategory[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ]);
}

export async function getPublicCategories() {
  const payload = await fetchJson<PublicCategory[] | Paginated<PublicCategory>>(
    "/api/v1/catalog/categories/"
  );

  return extractCollection<PublicCategory>(payload).map((category) => ({
    ...category,
    image: toAbsoluteUrl(category.image),
  }));
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
  const payload = await getFirstWorkingPayload<PublicProductRecord[] | Paginated<PublicProductRecord>>([
    `/api/v1/catalog/products/${query}`,
    `/api/catalog/products/${query}`,
    `/products/${query}`,
  ]);

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

export async function searchProducts(query: string, page = 1) {
  return getProducts({ search: query, page, page_size: 100 });
}

export async function getCategories() {
  return flattenCategories(await getPublicCategories());
}

export async function getActivePromoCodes() {
  const payload = await getFirstWorkingPayload<PublicPromoCode[]>([
    "/api/v1/promotions/codes-promo-actifs/",
    "/api/v1/promotions/codes/",
  ]);
  return extractCollection<PublicPromoCode>(payload);
}

export async function getActiveBanners() {
  const payload = await getFirstWorkingPayload<PublicBanner[]>([
    "/api/v1/promotions/recommendations-actives/",
    "/api/v1/promotions/banners/",
  ]);
  return extractCollection<PublicBanner>(payload).map((banner) => ({
    ...banner,
    image_url: toAbsoluteUrl(banner.image_url) ?? "",
  }));
}

export async function getActiveFlashSales() {
  const payload = await getFirstWorkingPayload<PublicFlashSale[]>([
    "/api/v1/promotions/soldes-actifs/",
    "/api/v1/promotions/flash-sales/",
  ]);
  return extractCollection<PublicFlashSale>(payload).map((sale) => ({
    ...sale,
    product_image: toAbsoluteUrl(sale.product_image) ?? "",
  }));
}

export async function getAdminPromoCodes(token: string) {
  const payload = await getFirstWorkingPayload<AdminPromoCode[]>(
    ["/api/v1/promotions/admin/codes-promo/", "/api/v1/promotions/admin/codes/"],
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
};

export async function createAdminPromoCode(token: string, payload: AdminPromoCodePayload) {
  return fetchMutationFirst<AdminPromoCode>(
    ["/api/v1/promotions/admin/codes-promo/", "/api/v1/promotions/admin/codes/"],
    {
      method: "POST",
      body: JSON.stringify({
        applicable_products: [],
        applicable_categories: [],
        restricted_to_tiers: [],
        ...payload,
      }),
      headers: authHeaders(token),
    }
  );
}

export type AdminFlashSale = {
  id: string;
  is_active: boolean;
  sale_price: string;
  original_price: string;
  quota_stock_limit: number;
  product_sold_count: number;
  starts_at: string;
  ends_at: string;
  product: string;
  variant?: string | null;
};

export async function getAdminFlashSales(token: string) {
  const payload = await getFirstWorkingPayload<AdminFlashSale[]>(
    ["/api/v1/promotions/admin/ventes-solde/", "/api/v1/promotions/admin/flash-sales/"],
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminFlashSale>(payload);
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

export async function getAdminProductVariants(token: string) {
  const payload = await fetchJson<AdminProductVariant[]>(
    "/api/v1/catalog/admin/product-variants/",
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return extractCollection<AdminProductVariant>(payload);
}

export async function getAdminProducts(token: string) {
  const payload = await fetchJson<AdminCatalogProduct[]>(
    "/api/v1/catalog/admin/products/",
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return extractCollection<AdminCatalogProduct>(payload).map(normalizeAdminProduct);
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

  const product = await fetchMutation<AdminCatalogProduct>("/api/v1/catalog/admin/products/", {
    method: "POST",
    body: JSON.stringify(sanitizedPayload),
    headers: authHeaders(token),
  });

  return normalizeAdminProduct(product);
}

export async function createAdminProductVariant(
  token: string,
  payload: AdminProductVariantPayload
) {
  return fetchMutation<AdminProductVariant>("/api/v1/catalog/admin/product-variants/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function createAdminProductImage(token: string, payload: AdminProductImagePayload) {
  const formData = new FormData();
  formData.append("product", payload.product);
  formData.append("image", payload.image, payload.image.name);
  formData.append("alt_text", payload.alt_text);
  formData.append("is_primary", String(payload.is_primary));

  if (payload.is_active !== undefined) {
    formData.append("is_active", String(payload.is_active));
  }

  const image = await fetchMutation<AdminProductImage>(
    "/api/v1/catalog/admin/product-images/",
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  return normalizeAdminProductImage(image);
}

export async function getAdminProductImages(token: string) {
  const payload = await fetchJson<AdminProductImage[]>(
    "/api/v1/catalog/admin/product-images/",
    {
      headers: authHeaders(token),
    }
  );

  return extractCollection<AdminProductImage>(payload).map(normalizeAdminProductImage);
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
    }
  );

  return normalizeAdminProduct(product);
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

  return normalizeAdminProduct(product);
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
  const payload = await getFirstWorkingPayload<MyRating[]>(
    ["/api/v1/catalog/notes-products/mes-notes/"],
    { headers: authHeaders(token) }
  );
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
  return fetchMutationFirst<RateProductResponse>(
    ["/api/v1/catalog/notes-products/", "/api/v1/catalog/rate/", "/api/v1/ratings/rate/"],
    {
      method: "POST",
      body: JSON.stringify({ product_id: productId, score }),
      headers: authHeaders(token),
    }
  );
}

export async function deleteProductRating(token: string, ratingId: string) {
  await fetchMutationFirst<void>(
    [
      `/api/v1/catalog/notes-products/delete/${ratingId}/`,
      `/api/v1/ratings/${ratingId}/delete/`,
    ],
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
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
  const payload = await getFirstWorkingPayload<FavoriteProduct[]>(
    [
      "/api/v1/catalog/products/my-favorites/",
      "/api/v1/catalog/my-favorites/",
      "/api/v1/favorites/my-favorites/",
    ],
    { headers: authHeaders(token) }
  );

  return extractCollection<FavoriteProduct>(payload).map((item) => ({
    ...item,
    image: toAbsoluteUrl(item.image),
  }));
}

export async function toggleFavorite(token: string, productId: string) {
  return fetchMutationFirst<ToggleFavoriteResponse>(
    ["/api/v1/catalog/favorites-toggle/", "/api/v1/catalog/toggle/", "/api/v1/favorites/toggle/"],
    {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
      headers: authHeaders(token),
    }
  );
}

export async function deleteFavorite(token: string, favoriteId: string) {
  await fetchMutationFirst<void>(
    [
      `/api/v1/catalog/favorites-delete/${favoriteId}/`,
      `/api/v1/favorites/${favoriteId}/`,
    ],
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
}

export type OrderSummary = {
  id: string;
  reference: string;
  status: string;
  items_total: string;
  frais_livraison: string;
  total_final: string;
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

export async function getOrders(token: string, filters?: OrderFilters) {
  const query = buildQueryString(filters);
  const payload = await getFirstWorkingPayload<OrderSummary[]>(
    [`/api/v1/commandes/mes-commandes/${query}`, `/api/v1/commandes/${query}`],
    { headers: authHeaders(token) }
  );
  return extractCollection<OrderSummary>(payload);
}

export async function getOrderByReference(token: string, reference: string) {
  return getFirstWorkingPayload<OrderDetail>(
    [
      `/api/v1/commandes/mes-commandes/${reference}/`,
      `/api/v1/commandes/${reference}/`,
    ],
    { headers: authHeaders(token) }
  );
}

export async function cancelOrder(token: string, reference: string) {
  return fetchMutationFirst<void>(
    [
      `/api/v1/commandes/mes-commandes/${reference}/cancel/`,
      `/api/v1/commandes/${reference}/cancel/`,
    ],
    { method: "POST", headers: authHeaders(token) }
  );
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
  const payload = await getFirstWorkingPayload<OrderHistoryEntry[]>(
    [
      `/api/v1/commandes/mes-commandes/${reference}/historique/`,
      `/api/v1/commandes/${reference}/history/`,
    ],
    { headers: authHeaders(token) }
  );
  return extractCollection<OrderHistoryEntry>(payload);
}

export async function getAdminOrders(token: string, filters?: OrderFilters) {
  const query = buildQueryString(filters);
  const payload = await getFirstWorkingPayload<OrderSummary[]>(
    [
      `/api/v1/commandes/admin/all-commandes/${query}`,
      `/api/v1/commandes/admin/${query}`,
    ],
    { headers: authHeaders(token) }
  );
  return extractCollection<OrderSummary>(payload);
}

export async function getAdminOrderByReference(token: string, reference: string) {
  return getFirstWorkingPayload<OrderDetail>(
    [
      `/api/v1/commandes/admin/commandes/${reference}/`,
      `/api/v1/commandes/admin/${reference}/`,
    ],
    { headers: authHeaders(token) }
  );
}

export async function updateAdminOrderStatus(
  token: string,
  reference: string,
  status: string,
  comment?: string
) {
  return fetchMutationFirst<{ status: string; comment?: string }>(
    [
      `/api/v1/commandes/admin/commandes/${reference}/status/`,
      `/api/v1/commandes/admin/${reference}/status/`,
    ],
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
  items: Array<{ product_id: string; quantity: number }>;
};

export async function checkoutOrder(token: string, payload: CheckoutPayload) {
  return fetchMutationFirst<CheckoutPayload & { reference?: string; id?: string }>(
    ["/api/v1/commandes/validate-commandes/", "/api/v1/commandes/checkout/"],
    {
      method: "POST",
      body: JSON.stringify(payload),
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
  return getFirstWorkingPayload<WalletBalance>(
    ["/api/v1/paiements/my-wallet/", "/api/v1/paiements/wallet/"],
    { headers: authHeaders(token) }
  );
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
  const payload = await getFirstWorkingPayload<WalletTransaction[]>(
    [
      "/api/v1/paiements/wallet/historique-transactions/",
      "/api/v1/paiements/wallet/transactions/",
    ],
    { headers: authHeaders(token) }
  );
  return extractCollection<WalletTransaction>(payload);
}

export type ValidatePromoResponse = {
  valid: boolean;
  code?: string;
  type?: string;
  value?: string;
  discount_amount?: string;
  description?: string;
  error_code?: string;
  detail?: string;
};

export async function validatePromoCode(token: string, code: string, cartTotal: string) {
  return fetchMutationFirst<ValidatePromoResponse>(
    ["/api/v1/promotions/codes-promo/validate/", "/api/v1/promotions/codes/validate/"],
    {
      method: "POST",
      body: JSON.stringify({ code, cart_total: cartTotal }),
      headers: authHeaders(token),
    }
  );
}

// Loyalty (Fidelite) Admin Types
export type LoyaltyTier = {
  id: string;
  name: string;
  min_points: number;
  min_solde: string;
  discount_percent: string;
};

export type AdminLoyaltyProfile = {
  id: string;
  tier: LoyaltyTier;
  tier_name: string;
  points_balance: number;
  total_points_earned: number;
  total_solde: string;
  next_tier: string | null;
  created_at: string;
};

export type AdminAdjustPointsPayload = {
  user_id: string;
  points: number;
  reason: string;
};

export type AdminAdjustPointsResponse = {
  success: boolean;
  user_email: string;
  points_adjusted: number;
  new_balance: number;
};

// Wallet (Paiements) Admin Types
export type AdminWallet = {
  id: string;
  user_email: string;
  user_name: string;
  balance: string;
  status: "active" | "suspendu" | "blocked";
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
  description: string;
};

export type AdminWithdrawResponse = {
  id: string;
  order: string | null;
  provider: string;
  payment_type: string;
  amount: string;
  status: string;
  reference_externe: string;
  created_at: string;
};

// Loyalty API functions
export async function getAdminLoyaltyProfiles(token: string) {
  const payload = await fetchJson<AdminLoyaltyProfile[]>(
    "/api/v1/fidelites/admin/profiles/",
    { headers: authHeaders(token) }
  );
  return extractCollection<AdminLoyaltyProfile>(payload);
}

export async function createAdminLoyaltyProfile(token: string, payload: Partial<AdminLoyaltyProfile>) {
  return fetchMutation<AdminLoyaltyProfile>("/api/v1/fidelites/admin/profiles/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function getAdminLoyaltyProfileById(token: string, id: string) {
  return fetchJson<AdminLoyaltyProfile>(
    `/api/v1/fidelites/admin/profiles/${id}/`,
    { headers: authHeaders(token) }
  );
}

export async function updateAdminLoyaltyProfile(token: string, id: string, payload: Partial<AdminLoyaltyProfile>) {
  return fetchMutation<AdminLoyaltyProfile>(`/api/v1/fidelites/admin/profiles/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function patchAdminLoyaltyProfile(token: string, id: string, payload: Partial<AdminLoyaltyProfile>) {
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

export async function adjustAdminLoyaltyPoints(token: string, payload: AdminAdjustPointsPayload) {
  return fetchMutation<AdminAdjustPointsResponse>("/api/v1/fidelites/admin/profiles/adjust_points/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function getLoyaltyTiers(token: string) {
  const payload = await fetchJson<LoyaltyTier[]>(
    "/api/v1/fidelites/liste-des-grades/",
    { headers: authHeaders(token) }
  );
  return extractCollection<LoyaltyTier>(payload);
}

// Wallet API functions
export async function getAdminAllWallets(token: string) {
  const payload = await fetchJson<AdminWallet[]>(
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

export async function adminWithdrawFunds(token: string, payload: AdminWithdrawPayload) {
  return fetchMutation<AdminWithdrawResponse>("/api/v1/paiements/admin/retrait-fonds/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function updateAdminWalletStatus(token: string, walletId: string, status: "active" | "suspendu" | "blocked") {
  return fetchMutation<AdminWallet>(`/api/v1/paiements/admin/wallets/${walletId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: authHeaders(token),
  });
}

export async function refundOrderAdmin(token: string, orderId: string) {
  return fetchMutation<{ detail: string; refunded_payments: any[] }>("/api/v1/paiements/remboursement-commande/", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId }),
    headers: authHeaders(token),
  });
}

