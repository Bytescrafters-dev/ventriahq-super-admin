import { NextRequest, NextResponse } from "next/server";
import {
  proxyToBackend,
  proxyToBackendWithAccess,
} from "@/lib/with-auth-proxy";

type RefreshResult =
  | { ok: false }
  | { ok: true; newAccess: string; setCookies: string[] };

let pendingRefresh: Promise<RefreshResult> | null = null;

function getRefresh(req: NextRequest): Promise<RefreshResult> {
  if (!pendingRefresh) {
    pendingRefresh = (async (): Promise<RefreshResult> => {
      const r = await fetch(new URL("/api/auth/refresh", req.url), {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") || "" },
      });
      if (!r.ok) return { ok: false };
      const data = await r.json();
      const newAccess = data?.access || data?.accessToken;
      const setCookies = r.headers.getSetCookie?.() ?? [];
      return { ok: true, newAccess, setCookies };
    })().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
}

async function attempt(req: NextRequest, path: string) {
  const res = await proxyToBackend(req, path);
  return res;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

async function handle(req: NextRequest, pathArr: string[]) {
  const path = pathArr.join("/");

  let res = await attempt(req, path);
  if (res.status !== 401) return res;

  const result = await getRefresh(req);

  if (!result.ok) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  res = await proxyToBackendWithAccess(req, path, result.newAccess);

  if (res.status === 401) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const headers = new Headers(res.headers);
  for (const cookie of result.setCookies) {
    headers.append("set-cookie", cookie);
  }
  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
