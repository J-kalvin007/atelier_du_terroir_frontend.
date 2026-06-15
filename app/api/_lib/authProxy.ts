import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function normalizeBaseUrl(rawBaseUrl: string) {
  const normalizedBase = rawBaseUrl.replace(/\/$/, "");

  if (!normalizedBase) {
    throw new Error("NEXT_PUBLIC_API_URL n'est pas configuree pour le proxy Next vers Django.");
  }

  const parsedUrl = new URL(normalizedBase);

  // Some shared ngrok links are communicated with a trailing `/8000`, but the
  // public tunnel already targets that port. We strip this synthetic path so
  // requests still hit the backend endpoints correctly.
  if (/^\/\d+$/.test(parsedUrl.pathname)) {
    parsedUrl.pathname = "";
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export function buildBackendUrl(path: string) {
  const normalizedBase = normalizeBaseUrl(API_BASE_URL);
  return `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isOfflineTunnelPayload(payload: unknown) {
  if (!payload) {
    return false;
  }

  if (typeof payload === "string") {
    return payload.includes("ERR_NGROK_3200") || payload.toLowerCase().includes("is offline");
  }

  if (typeof payload === "object") {
    const detail =
      "detail" in payload && typeof payload.detail === "string" ? payload.detail : undefined;

    if (!detail) {
      return false;
    }

    return detail.includes("ERR_NGROK_3200") || detail.toLowerCase().includes("is offline");
  }

  return false;
}

export function toGatewayPayload(payload: unknown) {
  return {
    detail:
      "Le lien ngrok du backend est hors ligne ou inaccessible. Relance le tunnel backend puis reessaie.",
    cause: payload,
  };
}

function copyResponseHeaders(headers: Headers) {
  const nextHeaders = new Headers();

  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === "content-encoding") {
      continue;
    }

    nextHeaders.set(key, value);
  }

  return nextHeaders;
}

export function applyBackendProxyHeaders(headers: Headers) {
  headers.set("ngrok-skip-browser-warning", "true");
  return headers;
}

export async function proxyToBackend(request: Request, path: string) {
  try {
    const targetUrl = buildBackendUrl(path);
    const requestOrigin = new URL(request.url).origin;
    const targetOrigin = new URL(targetUrl).origin;

    if (requestOrigin === targetOrigin) {
      throw new Error(
        "NEXT_PUBLIC_API_URL pointe vers le frontend Next.js. Configure l'URL du backend Django sur un autre port ou domaine."
      );
    }

    const headers = applyBackendProxyHeaders(new Headers());

    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    const accept = request.headers.get("accept");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    if (authorization) {
      headers.set("authorization", authorization);
    }

    if (accept) {
      headers.set("accept", accept);
    }

    const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: copyResponseHeaders(response.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de contacter le backend d'authentification.";

    return NextResponse.json(
      {
        detail:
          message === "fetch failed"
            ? "Le frontend n'arrive pas a joindre le lien ngrok du backend. Verifie que le tunnel est bien actif et accessible depuis cette machine."
            : message,
      },
      { status: 500 }
    );
  }
}
