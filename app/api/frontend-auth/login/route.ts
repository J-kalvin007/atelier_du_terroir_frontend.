import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";

type LoginRequestPayload = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginRequestPayload;
    const identifier =
      payload.name?.trim() || payload.username?.trim() || payload.email?.trim() || "";
    const email = payload.email?.trim() || (identifier.includes("@") ? identifier : "");

    if (!identifier || !payload.password) {
      return NextResponse.json(
        { detail: "Les champs de connexion sont incomplets." },
        { status: 400 }
      );
    }

    let primaryResponse: Response | null = null;
    let primaryPayload: unknown = null;

    for (const candidate of buildLoginCandidates(identifier, email, payload.password)) {
      const response = await fetch(buildBackendUrl("/api/connexion/"), {
        method: "POST",
        headers: applyBackendProxyHeaders(
          new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
          })
        ),
        body: JSON.stringify(candidate),
        cache: "no-store",
      });

      const parsedPayload = await parseResponsePayload(response);

      if (response.ok) {
        return NextResponse.json(parsedPayload, { status: response.status });
      }

      if (isOfflineTunnelPayload(parsedPayload)) {
        return NextResponse.json(toGatewayPayload(parsedPayload), { status: 502 });
      }

      primaryResponse = response;
      primaryPayload = parsedPayload;

      if (response.status !== 400 && response.status !== 401) {
        break;
      }
    }

    if (!primaryResponse) {
      return NextResponse.json(
        { detail: "Aucune tentative de connexion n'a pu etre executee." },
        { status: 500 }
      );
    }

    const primaryDetail =
      primaryPayload &&
      typeof primaryPayload === "object" &&
      "detail" in primaryPayload &&
      typeof primaryPayload.detail === "string"
        ? primaryPayload.detail
        : "";

    if (
      primaryResponse.status === 400 &&
      primaryDetail.includes('Must include "email" and "password".')
    ) {
      const retryResponse = await fetch(buildBackendUrl("/api/connexion/"), {
        method: "POST",
        headers: applyBackendProxyHeaders(
          new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
          })
        ),
        body: JSON.stringify({
          email: email || identifier,
          ...(payload.name?.trim() ? { name: payload.name.trim() } : {}),
          password: payload.password,
        }),
        cache: "no-store",
      });

      const retryPayload = await parseResponsePayload(retryResponse);

      if (retryResponse.ok) {
        return NextResponse.json(retryPayload, { status: retryResponse.status });
      }

      return NextResponse.json(retryPayload, { status: retryResponse.status });
    }

    if (primaryResponse.status !== 404) {
      if (primaryResponse.status !== 502 && primaryResponse.status !== 503) {
        const errorPayload = primaryPayload;
        return NextResponse.json(errorPayload, { status: primaryResponse.status });
      }
    }

    let lastFallbackResponse: Response | null = null;
    let lastFallbackPayload: Record<string, unknown> | null = null;

    for (const fallbackIdentifier of buildFallbackIdentifiers(identifier, email)) {
      const fallbackBody = new URLSearchParams({
        username: fallbackIdentifier,
        password: payload.password,
      });

      const fallbackResponse = await fetch(buildBackendUrl("/api/auth-token/"), {
        method: "POST",
        headers: applyBackendProxyHeaders(
          new Headers({
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          })
        ),
        body: fallbackBody.toString(),
        cache: "no-store",
      });

      const fallbackPayload = (await parseResponsePayload(fallbackResponse)) as Record<string, unknown>;

      if (isOfflineTunnelPayload(fallbackPayload)) {
        return NextResponse.json(toGatewayPayload(fallbackPayload), { status: 502 });
      }

      lastFallbackResponse = fallbackResponse;
      lastFallbackPayload = fallbackPayload;

      if (fallbackResponse.ok) {
        return NextResponse.json(
          {
            key: fallbackPayload.token,
          },
          { status: fallbackResponse.status }
        );
      }
    }

    if (lastFallbackResponse && lastFallbackPayload) {
      return NextResponse.json(lastFallbackPayload, { status: lastFallbackResponse.status });
    }

    return NextResponse.json(
      { detail: "Impossible de finaliser la connexion avec les endpoints disponibles." },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de traiter la connexion cote frontend.",
      },
      { status: 500 }
    );
  }
}

function buildLoginCandidates(identifier: string, email: string, password: string) {
  const localPart = email.includes("@") ? (email.split("@")[0] ?? "").trim() : "";
  const rawCandidates = [
    email ? { email, password } : null,
    { name: identifier, password },
    { username: identifier, password },
    localPart && localPart !== identifier ? { username: localPart, password } : null,
    email ? { name: identifier, email, password } : null,
  ].filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));

  const uniqueCandidates = new Map<string, (typeof rawCandidates)[number]>();

  for (const candidate of rawCandidates) {
    uniqueCandidates.set(JSON.stringify(candidate), candidate);
  }

  return [...uniqueCandidates.values()];
}

function buildFallbackIdentifiers(identifier: string, email: string) {
  const localPart = email.includes("@") ? (email.split("@")[0] ?? "").trim() : "";
  const candidates = [identifier, email, localPart].filter(
    (value): value is string => Boolean(value && value.trim())
  );

  return [...new Set(candidates)];
}

async function parseResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return (await response.json()) as unknown;
    }

    const text = await response.text();
    return text ? { detail: text } : {};
  } catch {
    return { detail: "Reponse backend non lisible." };
  }
}
