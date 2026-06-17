import { NextResponse } from "next/server";
import { getRefreshTokenFromCookies, setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";

export const POST = async () => {
  console.log("called refresh token api");
  const refresh = await getRefreshTokenFromCookies();
  console.log(refresh);
  if (!refresh)
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });

  const res = await fetch(`${env.BACKEND_URL}/super-admin/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok)
    return NextResponse.json({ message: "Refresh failed" }, { status: 401 });

  const data = await res.json();

  console.log("from refresh giving out data");
  console.log(data);
  const accessToken = data?.access;
  const refreshToken = data?.refresh;
  if (!(accessToken && refreshToken)) {
    console.log("from refresh empty access and refresh");
    return NextResponse.json(
      { message: "Invalid refresh response" },
      { status: 500 },
    );
  }

  await setAuthCookies(
    accessToken,
    10 * 60 * 60,
    refreshToken,
    60 * 60 * 24 * 30,
  );

  return NextResponse.json({ ok: true, access: accessToken, refresh: refreshToken });
};
