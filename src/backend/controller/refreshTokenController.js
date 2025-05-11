import { NextResponse } from "next/server";
import { catchAsync } from "../utils/captureErrors";
import AppError from "../utils/AppError";
import RefreshToken from "../model/refreshTokenModel";
import User from "../model/userModel";
import dbConnect from "../db";
import { headers } from "next/headers";
import { encryptAccessToken, decryptRefreshToken } from "../session";

export const refreshAccessToken = catchAsync(async (req, event, next) => {
  await dbConnect();
  const authorization = headers().get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AppError("Unauthorized route.", 401);
  }
  const refreshToken = authorization.split(" ")[1];
  if (!refreshToken) throw new AppError("Refresh token is required", 401);
  const payload = await decryptRefreshToken(refreshToken);
  if (!payload) throw new AppError("Invalid or expired refresh token", 401);
  const refreshTokenDoc = await RefreshToken.findById(refreshToken).populate({
    path: "userId",
    select: "+passwordChangedDate",
  });
  if (!refreshTokenDoc)
    throw new AppError("Invalid or expired refresh token", 401);
  const user = refreshTokenDoc.userId;

  if (!user) throw new AppError("User has been deleted", 401);

  if (
    user.passwordChangedDate &&
    Math.floor(user.passwordChangedDate / 1000) > payload.iat
  ) {
    throw new AppError(
      "Invalid token. Password has been changed. Please login again.",
      401
    );
  }

  const newAccessToken = await encryptAccessToken({ userId: payload.userId });

  return NextResponse.json(
    { newAccessToken, userID: payload.userId },
    { status: 200 }
  );
});
