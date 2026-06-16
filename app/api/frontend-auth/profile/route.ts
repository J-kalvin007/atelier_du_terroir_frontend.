import { NextResponse } from "next/server";
import {
  applyBackendProxyHeaders,
  buildBackendUrl,
  isOfflineTunnelPayload,
  toGatewayPayload,
} from "@/app/api/_lib/authProxy";
import { mergeAuthProfileRecords } from "@/lib/auth-profile";

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

    const [meResult, userResult] = await Promise.all([
      fetchBackendProfile("/api/users/me/", headers),
      fetchBackendProfile("/api/auth/user/", headers),
    ]);

    if (isOfflineTunnelPayload(meResult.payload) || isOfflineTunnelPayload(userResult.payload)) {
      return NextResponse.json(
        toGatewayPayload(meResult.payload ?? userResult.payload),
        { status: 502 }
      );
    }

    if (!meResult.ok && !userResult.ok) {
      return NextResponse.json(meResult.payload ?? userResult.payload ?? { detail: "Profil indisponible." }, {
        status: meResult.status === 404 ? userResult.status : meResult.status,
      });
    }

    const mergedProfile = mergeAuthProfileRecords(
      meResult.ok ? (meResult.payload as Record<string, unknown>) : null,
      userResult.ok ? (userResult.payload as Record<string, unknown>) : null
    );

    return NextResponse.json(mergedProfile, { status: 200 });
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

async function fetchBackendProfile(path: string, headers: Headers) {
  const response = await fetch(buildBackendUrl(path), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const payload = await parseResponsePayload(response);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
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
