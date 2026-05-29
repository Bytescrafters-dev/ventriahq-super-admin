import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const JWT_COOKIE = env.JWT_COOKIE_NAME;
const PROTECTED = ["/"];

export const middleware = (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  const needsAuth = PROTECTED.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(JWT_COOKIE)?.value;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth/login).*)"],
};
