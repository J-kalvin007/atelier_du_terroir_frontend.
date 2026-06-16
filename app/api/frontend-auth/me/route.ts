import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json({ detail: "En-tete Authorization manquant." }, { status: 401 });
    }

    const headers = applyBackendProxyHeaders(
      new Headers({
        Accept: "application/json",
        Authorization: authorization,
      })
    );

    const response = await fetch(buildBackendUrl("/api/users/me/"), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const payload = await parseResponsePayload(response);

    if (isOfflineTunnelPayload(payload)) {
      return NextResponse.json(toGatewayPayload(payload), { status: 502 });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de recuperer /api/users/me/ cote frontend.",
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
