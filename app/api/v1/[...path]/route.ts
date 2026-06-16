import { proxyToBackendV1 } from "@/app/api/_lib/backendProxy";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const segments = path.filter(Boolean);
  const pathname = `/api/v1/${segments.join("/")}/`;
  const query = new URL(request.url).search;

  return proxyToBackendV1(request, `${pathname}${query}`);
}

export async function GET(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}
