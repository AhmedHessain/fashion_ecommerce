"use server";
import User from "@/backend/model/userModel";
import { catchAsyncServerActions } from "@/backend/utils/captureErrors";
import { uploadImageFromBuffer } from "@/utils/cloudinary";
import AppError from "@/backend/utils/AppError";
import dbConnect from "@/backend/db";
import {
  createSession,
  deleteSession,
  decryptAccessToken,
} from "@/backend/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import startAsyncTransaction from "@/backend/utils/startAsyncTransaction";
import ResetToken from "@/backend/model/resetTokenModel";
import { sendResetPasswordEmail } from "@/backend/utils/emails";
import crypto from "crypto";
import argon2 from "argon2";
import { validateResetToken } from "@/backend/controller/authController";

export const signup = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const image = formData.get("image");
  await startAsyncTransaction(async function (session) {
    const users = await User.create(
      [
        {
          name,
          email,
          password,
        },
      ],
      { session: session }
    );
    const user = users[0];
    if (user && image) {
      const imageUrl = await uploadImageFromBuffer(image);

      if (!imageUrl) {
        throw new AppError("Problem occured with image upload process", 500);
      }

      user.imageUrl = imageUrl;
      await user.save({ session: session });
    }
    await createSession(user._id);
  });
  redirect("/");
});

export const login = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const email = formData.get("email");
  const password = formData.get("password");

  const user = await User.findOne({ email }).select("+password");

  if (
    !user ||
    user.password === "00000000" ||
    !(await user.isPasswordMatch(user.password, password))
  ) {
    throw new AppError("email or password is invalid.", 401);
  }

  await createSession(user._id);

  redirect("/");
});

export const forgetPassword = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const email = formData.get("email");

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("No user found", 404);
  }

  await startAsyncTransaction(async function (session) {
    const resetTokenQuery = await ResetToken.findOne({
      _id: user._id,
    }).session(session);

    if (resetTokenQuery) {
      await resetTokenQuery.deleteOne().session(session);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = await argon2.hash(resetToken);

    await ResetToken.create(
      [
        {
          _id: user._id,
          resetToken: hashedResetToken,
        },
      ],
      { session: session }
    );

    const resetURL = `${process.env.HOST}/reset-password/${user._id}/${resetToken}`;
    // Don't use url.get('host') to avoid host header injection attacks
    // Ensure that the reset password page adds the Referrer Policy tag with the noreferrer

    await sendResetPasswordEmail(user.email, resetURL);
  });
});

export const resetPassword = catchAsyncServerActions(async (formData) => {
  const password = formData.get("password");
  const userID = formData.get("userID");
  const resetToken = formData.get("resetToken");

  const user = await validateResetToken(userID, resetToken);

  user.password = password;

  await startAsyncTransaction(async function (session) {
    await user.save({ session: session });
    await ResetToken.findByIdAndDelete(userID).session(session);
  });
});

export const logout = catchAsyncServerActions(async () => {
  await dbConnect();
  await deleteSession();
  return redirect("/login");
});

export async function GetCurrentUser() {
  const accessToken = cookies().get("accessToken")?.value;
  if (!accessToken) return null;
  const accessTokenPayload = await decryptAccessToken(accessToken);
  const userId = accessTokenPayload?.userId;
  if (!userId) return null;
  await dbConnect();
  const userJson = await User.findById(userId).select("-__v").lean();
  const user = { ...userJson, _id: userJson._id.toString() };
  if (!user) return null;
  return user;
}
