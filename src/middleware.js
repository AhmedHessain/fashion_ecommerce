import { NextResponse } from "next/server";
import { decryptAccessToken } from "@/backend/sessionEdge";
import { checkRoutes } from "./utils/utilFunctions";

const protectedRoutes = ["/", "/about", "/contact", "/wishlist"];

const publicRoutes = [
  "/login",
  "/register",
  "/reset-password/:userID/:resetToken",
  "/forget-password",
];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = checkRoutes(protectedRoutes, path);
  const isPublicRoute = checkRoutes(publicRoutes, path);

  const accessToken = req.cookies.get("accessToken")?.value;

  const accessTokenPayload = await decryptAccessToken(accessToken);

  /*
   * Access token is valid
   */
  if (accessTokenPayload?.userId) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  /*
   * Access token is invalid/expired.
   *
   * We DON'T touch MongoDB here.
   *
   * Instead, let the refresh API route handle
   * refresh-token validation and rotation.
   */
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (refreshToken) {
    const refreshResponse = await fetch(new URL("/api/refreshToken", req.url), {
      method: "POST",
      headers: {
        authorization: `Bearer ${refreshToken}`,
      },
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      // 1. Create request headers copy to pass payload downstream to Server Components
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-access-token", data.newAccessToken);

      // 2. Pass requestHeaders to NextResponse.next
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // 3. Set cookie for subsequent browser requests
      response.cookies.set("accessToken", data.newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_DATE) * 60,
      });
      return response;
    }
  }

  /*
   * No valid access token and no successful refresh.
   */
  if (isProtectedRoute) {
    const response = NextResponse.redirect(new URL("/login", req.url));

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
