import { proxyToBackendV1 } from "@/app/api/_lib/backendProxy";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const { search } = new URL(request.url);
  const backendPath = `/api/v1/${path.join("/")}/${search}`;

  return proxyToBackendV1(request, backendPath);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
