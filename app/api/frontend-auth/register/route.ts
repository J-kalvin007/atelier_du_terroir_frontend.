import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const requestPayload = (await request.json()) as Record<string, unknown>;
    const name =
      typeof requestPayload.name === "string" && requestPayload.name.trim().length > 0
        ? requestPayload.name.trim()
        : undefined;
    const backendPayload = {
      ...Object.fromEntries(
        Object.entries(requestPayload).filter(([key]) => key !== "username")
      ),
      ...(name ? { name } : {}),
    };

    const response = await fetch(buildBackendUrl("/api/auth/registration/"), {
      method: "POST",
      headers: applyBackendProxyHeaders(
        new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        })
      ),
      body: JSON.stringify(backendPayload),
      cache: "no-store",
    });

    const responsePayload = await parseResponsePayload(response);

    if (isOfflineTunnelPayload(responsePayload)) {
      return NextResponse.json(toGatewayPayload(responsePayload), { status: 502 });
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de traiter l'inscription cote frontend.",
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
