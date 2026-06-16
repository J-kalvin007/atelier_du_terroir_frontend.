import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

async function forwardAuthUserRequest(request: Request, method: string) {
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

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = hasBody ? await request.text() : undefined;

  const response = await fetch(buildBackendUrl("/api/auth/user/"), {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const payload = await parseResponsePayload(response);

  if (isOfflineTunnelPayload(payload)) {
    return NextResponse.json(toGatewayPayload(payload), { status: 502 });
  }

  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request) {
  try {
    return await forwardAuthUserRequest(request, "GET");
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de recuperer /api/auth/user/ cote frontend.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    return await forwardAuthUserRequest(request, "PATCH");
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de mettre a jour /api/auth/user/ cote frontend.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    return await forwardAuthUserRequest(request, "PUT");
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Impossible de mettre a jour /api/auth/user/ cote frontend.",
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
