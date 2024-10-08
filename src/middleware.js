import { NextResponse } from "next/server";
import { decryptAccessToken, refreshAccessToken } from "@/backend/session";
import { cookies } from "next/headers";
import { checkRoutes } from "./utils/utilFunctions";

// 1. Specify protected and public routes (public routes won't appear for authenticated users)
const protectedRoutes = ["/"];
const publicRoutes = [
  "/login",
  "/register",
  "/reset-password/:userID/:resetToken",
  "/forget-password",
];

export default async function middleware(req) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = checkRoutes(protectedRoutes, path);
  const isPublicRoute = checkRoutes(publicRoutes, path);
  // 3. Decrypt the accessTokenPayload from the cookie
  const cookie = cookies().get("accessToken")?.value;

  const accessTokenPayload = await decryptAccessToken(cookie);

  if (!accessTokenPayload) {
    const res = await refreshAccessToken(req.nextUrl.href);
    if (res) return res;
  }

  // 4. Redirect to /login if the user is not authenticated and in protected route
  if (isProtectedRoute && !accessTokenPayload?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to / if the user is authenticated and in public route
  if (isPublicRoute && accessTokenPayload?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
