import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";

export const POST = async (req: Request) => {
  console.log("[login] BACKEND_URL configured:", !!process.env.BACKEND_URL);

  try {
    const body = await req.json();

    const res = await fetch(`${env.BACKEND_URL}/super-admin/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("[login] backend status:", res.status);

    if (!res.ok) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const data = await res.json();
    const access = data?.access;
    const refresh = data?.refresh;
    const mustChangePassword = data?.mustChangePassword;

    if (!(access && refresh)) {
      console.error("[login] missing tokens in backend response:", Object.keys(data));
      return NextResponse.json(
        { message: "Invalid login response" },
        { status: 500 },
      );
    }

    await setAuthCookies(access, 10 * 60 * 60, refresh, 60 * 60 * 24 * 30);

    return NextResponse.json({ ok: true, mustChangePassword });
  } catch (err) {
    console.error("[login] error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ message: "Login error" }, { status: 500 });
  }
};
