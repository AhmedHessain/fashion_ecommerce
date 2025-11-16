import { cookies } from "next/headers";
import dbConnect from "@/backend/db";
import User from "@/backend/model/userModel";
import RefreshToken from "@/backend/model/refreshTokenModel";
import {
  decryptAccessToken,
  decryptRefreshToken,
  encryptAccessToken,
} from "@/backend/session";

/**
 * Securely resolves the current user:
 *  - Uses accessToken if valid
 *  - Otherwise, uses refreshToken, issues new accessToken cookie
 *  - Throws if neither works
 */
export async function getUserFromAccessOrRefreshToken() {
  await dbConnect();
  const cookieStore = cookies();

  // 1) Try accessToken
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    try {
      const payload = await decryptAccessToken(accessToken);
      const userId = payload?.userId;
      if (userId) {
        const user = await User.findById(userId).lean();
        if (user) return user;
      }
    } catch {
      // ignore, fall through to refreshToken
    }
  }

  // 2) Try refreshToken
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) throw new Error("Unauthorized: no valid tokens");

  const payload = await decryptRefreshToken(refreshToken);
  if (!payload?.userId) throw new Error("Unauthorized: invalid refresh token");

  const refreshDoc = await RefreshToken.findById(refreshToken).populate(
    "userId"
  );
  if (!refreshDoc || !refreshDoc.userId) {
    throw new Error("Unauthorized: refresh token not found");
  }

  const userDoc = refreshDoc.userId;

  // 3) Re-issue new accessToken
  const newAccessToken = await encryptAccessToken({ userId: userDoc._id });
  cookieStore.set({
    name: "accessToken",
    value: newAccessToken,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return JSON.parse(JSON.stringify(userDoc));
}
