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

  if (fieldErrors.length > 0) {
    return fieldErrors.join(" | ");
  }

  return fallback;
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
