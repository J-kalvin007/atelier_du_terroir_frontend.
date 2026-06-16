import { proxyToBackend } from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/auth/user/");
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, "/api/auth/user/");
}

export async function PUT(request: Request) {
  return proxyToBackend(request, "/api/auth/user/");
}
