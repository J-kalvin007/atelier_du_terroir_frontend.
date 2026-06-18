import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: string | number,
  currency: string = "FCFA",
  locale: string = "fr-FR"
): string {
  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/\s/g, "").replace(/[^\d.-]/g, ""))
      : amount;

  if (Number.isNaN(numAmount)) {
    return String(amount);
  }

  if (currency === "FCFA" || currency === "XOF" || currency === "XAF") {
    return (
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount) + " FCFA"
    );
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch {
    return (
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount) +
      " " +
      currency
    );
  }
}

export function formatDate(
  dateStr: string | null | undefined,
  locale: string = "fr-FR",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
  } catch {
    return "—";
  }
}

export function getOrderStatusLabel(status: string, locale: string = "fr"): string {
  const normalized = status.toLowerCase();
  const labels: Record<string, Record<string, string>> = {
    draft: { fr: "Brouillon", en: "Draft" },
    pending_payment: { fr: "Paiement en attente", en: "Pending payment" },
    paid: { fr: "Payee", en: "Paid" },
    confirmed: { fr: "Confirmee", en: "Confirmed" },
    processing: { fr: "En preparation", en: "Processing" },
    shipped: { fr: "Expediee", en: "Shipped" },
    delivered: { fr: "Livree", en: "Delivered" },
    cancelled: { fr: "Annulee", en: "Cancelled" },
    refunded: { fr: "Remboursee", en: "Refunded" },
    pending: { fr: "En attente", en: "Pending" },
    preparing: { fr: "En preparation", en: "Preparing" },
  };
  return labels[normalized]?.[locale] || status;
}

/** Slug conforme Swagger : max 50, pattern ^[-a-zA-Z0-9_]+$ */
export function sanitizeApiSlug(value: string, fallbackName = ""): string {
  const source = value.trim() || fallbackName.trim();
  const slug = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "")
    .toLowerCase()
    .slice(0, 50);

  if (slug) {
    return slug;
  }

  return "item";
}

/** Extrait un message lisible depuis une page d'erreur HTML Django (DEBUG=True). */
export function parseDjangoHtmlError(html: string): string | null {
  if (!html.includes("Exception Type:") && !html.includes("<!DOCTYPE html>")) {
    return null;
  }

  const exceptionType = html.match(/Exception Type:\s*([^\n<]+)/)?.[1]?.trim();
  const exceptionValue = html.match(/Exception Value:\s*([^\n<]+)/)?.[1]?.trim();

  if (exceptionValue?.includes("too many clients already")) {
    return "Le serveur PostgreSQL est saturé (trop de connexions). Redémarrez le backend Docker, puis réessayez dans quelques secondes.";
  }

  if (exceptionType === "ValidationError" && exceptionValue) {
    const quotedMessages = [...exceptionValue.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    if (quotedMessages.length > 0) {
      return quotedMessages.join(" ");
    }
  }

  if (exceptionType && exceptionValue) {
    return exceptionValue.replace(/^\[|\]$/g, "").replace(/'/g, "").trim() || `${exceptionType}: ${exceptionValue}`;
  }

  const title = html.match(/<title>\s*([^<]+?)\s*<\/title>/i)?.[1]?.trim();
  if (title && title.includes(" at /")) {
    const [headline] = title.split(/\s+at\s+/);
    if (headline?.trim()) {
      return headline.trim();
    }
  }

  return "Erreur serveur Django (500). Vérifiez que le backend est disponible.";
}

function readPublicApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).replace(/\/$/, "");
}

/** Normalise une URL d'image Django (/media/...) pour affichage via le proxy Next.js. */
export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const url = value.trim();

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  const apiBase = readPublicApiBaseUrl();

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/media/")) {
        return `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      // Ignore invalid absolute URLs.
    }

    if (apiBase && url.startsWith(apiBase)) {
      const path = url.slice(apiBase.length);
      if (path.startsWith("/media/")) {
        return path;
      }
    }

    return url;
  }

  if (url.startsWith("/media/")) {
    return url;
  }

  if (url.startsWith("media/")) {
    return `/${url}`;
  }

  if (apiBase) {
    return resolveMediaUrl(`${apiBase}${url.startsWith("/") ? url : `/${url}`}`);
  }

  return url.startsWith("/") ? url : `/${url}`;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID_PATTERN.test(value.trim()));
}

/** Prix decimal Swagger : ^-?\d{0,10}(?:\.\d{0,2})?$ */
export function sanitizeDecimalPrice(value: string): string {
  const normalized = value.trim().replace(/\s/g, "").replace(/,/g, ".");
  const match = normalized.match(/^-?\d{0,10}(?:\.\d{0,2})?/);
  return match?.[0] || "0";
}

export function parseApiErrorPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  const detail =
    typeof record.detail === "string"
      ? record.detail
      : typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : null;

  if (detail?.trim()) {
    return detail.trim();
  }

  const fieldErrors: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" && value.trim()) {
      fieldErrors.push(`${key}: ${value}`);
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const messages = value.filter((item): item is string => typeof item === "string");
      if (messages.length > 0) {
        fieldErrors.push(`${key}: ${messages.join(" ")}`);
      }
    }
  }

  return fieldErrors.length > 0 ? fieldErrors.join(" | ") : fallback;
}

export function readApiError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();

    if (message.startsWith("{") || message.startsWith("[")) {
      try {
        return parseApiErrorPayload(JSON.parse(message), message);
      } catch {
        return message;
      }
    }

    return message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response?.data
  ) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    return parseApiErrorPayload(data, fallback);
  }

  return fallback;
}

export function isPermissionDeniedError(error: unknown) {
  const message = readApiError(error, "").toLowerCase();

  return (
    message.includes("403") ||
    message.includes("acces refuse") ||
    message.includes("permission") ||
    message.includes("you do not have permission")
  );
}

export function isInvalidAuthTokenError(error: unknown) {
  const message = readApiError(error, "").toLowerCase();

  return (
    message.includes("invalid token") ||
    message.includes("token non valide") ||
    message.includes("session a expire") ||
    message.includes("session expir") ||
    message.includes("authentication credentials were not provided") ||
    message.includes("informations d'authentification")
  );
}
