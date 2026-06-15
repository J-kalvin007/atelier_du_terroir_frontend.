import { proxyToBackend } from "@/app/api/_lib/authProxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/auth/registration/");
}
