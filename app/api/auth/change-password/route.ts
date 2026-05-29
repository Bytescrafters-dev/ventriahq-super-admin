import { NextResponse } from "next/server";
import { getAccessTokenFromCookies, setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";

export const POST = async (req: Request) => {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(
      `${env.BACKEND_URL}/super-admin/auth/change-password`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.message ?? "Failed to change password" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const access = data?.access;
    const refresh = data?.refresh;
    if (!(access && refresh)) {
      return NextResponse.json(
        { message: "Invalid change-password response" },
        { status: 500 },
      );
    }

    await setAuthCookies(access, 10 * 60 * 60, refresh, 60 * 60 * 24 * 30);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Change password error" },
      { status: 500 },
    );
  }
};
