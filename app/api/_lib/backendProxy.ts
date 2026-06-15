import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

function normalizeBaseUrl(rawBaseUrl: string) {
  const normalizedBase = rawBaseUrl.replace(/\/$/, "");

  if (!normalizedBase) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL ou NEXT_PUBLIC_API_URL doit etre configuree pour le proxy backend."
    );
  }

  const parsedUrl = new URL(normalizedBase);

  if (/^\/\d+$/.test(parsedUrl.pathname)) {
    parsedUrl.pathname = "";
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export function buildBackendUrl(path: string) {
  const normalizedBase = normalizeBaseUrl(API_BASE_URL);
  return `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
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

export async function proxyToBackendV1(request: Request, backendPath: string) {
  try {
    const targetUrl = buildBackendUrl(backendPath);
    const requestOrigin = new URL(request.url).origin;
    const targetOrigin = new URL(targetUrl).origin;

    if (requestOrigin === targetOrigin) {
      throw new Error(
        "L'URL API pointe vers le frontend Next.js. Configure l'URL du backend Django sur un autre port ou domaine."
      );
    }

    const headers = new Headers();
    headers.set("ngrok-skip-browser-warning", "true");

    const authorization = request.headers.get("authorization");
    const accept = request.headers.get("accept");
    const contentType = request.headers.get("content-type");

    if (authorization) {
      headers.set("authorization", authorization);
    }

    if (accept) {
      headers.set("accept", accept);
    }

    const method = request.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);
    let body: BodyInit | undefined;

    if (hasBody) {
      if (contentType?.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        if (contentType) {
          headers.set("content-type", contentType);
        }
        body = await request.text();
      }
    }

    const response = await fetch(targetUrl, {
      method,
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
      error instanceof Error ? error.message : "Impossible de contacter le backend Django.";

    return NextResponse.json(
      {
        detail:
          message === "fetch failed"
            ? "Le frontend n'arrive pas a joindre le backend. Verifie que le tunnel ngrok ou le serveur Django est actif."
            : message,
      },
      { status: 500 }
    );
  }
}
