import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";

const PROFILE_ENDPOINTS = ["/api/users/me/", "/api/auth/user/"] as const;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json({ detail: "En-tete Authorization manquant." }, { status: 401 });
    }

    for (const endpoint of PROFILE_ENDPOINTS) {
      const response = await fetch(buildBackendUrl(endpoint), {
        method: "GET",
        headers: applyBackendProxyHeaders(
          new Headers({
          Accept: "application/json",
          Authorization: authorization,
          })
        ),
        cache: "no-store",
      });

      if (response.ok) {
        const payload = await response.json();
        return NextResponse.json(payload, { status: response.status });
      }

      const payload = await parseResponsePayload(response);

      if (isOfflineTunnelPayload(payload)) {
        return NextResponse.json(toGatewayPayload(payload), { status: 502 });
      }

      if (response.status !== 404) {
        return NextResponse.json(payload, { status: response.status });
      }
    }

    return NextResponse.json(
      { detail: "Aucun endpoint profil disponible sur le backend." },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de recuperer le profil cote frontend.",
      },
      { status: 500 }
    );
  }
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
