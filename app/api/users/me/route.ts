import { proxyToBackend } from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/users/me/");
}
