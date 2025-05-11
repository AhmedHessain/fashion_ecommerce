import { catchAsync } from "@/backend/utils/captureErrors";
import AppError from "@/backend/utils/AppError";
import User from "@/backend/model/userModel";
import { decryptAccessToken } from "../session";
import { headers } from "next/headers";
import ResetToken from "../model/resetTokenModel";
import dbConnect from "../db";
import argon2 from "argon2";
import { NextResponse } from "next/server";
export const protect = catchAsync(async (req, event, next) => {
  await dbConnect();
  const authorization = headers().get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AppError("Unauthorized route.", 401);
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    throw new AppError("Missing token.", 401);
  }

  const accessTokenPayload = await decryptAccessToken(token);

  if (!accessTokenPayload?.userId)
    throw new AppError("Expired or invalid token", 401);

  req.currentUserId = accessTokenPayload.userId;

  return next();
});

export const validateResetToken = async (userID, resetToken) => {
  await dbConnect();
  const user = await User.findById(userID);

  if (!user) {
    throw new AppError("User is not found or deleted", 404);
  }

  if (!resetToken) {
    throw new AppError("Invalid or expired reset token", 401);
  }

  const hashedResetToken = await ResetToken.findById(userID);

  if (!hashedResetToken) {
    throw new AppError("Invalid or expired reset token", 401);
  }

  if (!(await argon2.verify(hashedResetToken.resetToken, resetToken))) {
    throw new AppError("Invalid or expired reset token", 401);
  }

  return user;
};
