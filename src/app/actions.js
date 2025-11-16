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
import {
  sendContactFormEmail,
  sendResetPasswordEmail,
} from "@/backend/utils/emails";
import crypto from "crypto";
import argon2 from "argon2";
import { validateResetToken } from "@/backend/controller/authController";
import { getUserFromAccessOrRefreshToken } from "@/backend/utils/auth";

export const signup = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const image = formData.get("image");
  let user = null;
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
    user = users[0];
    if (user && image) {
      const FormDataimage = new FormData();
      FormDataimage.append("image", image);

      const imageUrl = await uploadImageFromBuffer(FormDataimage);

      if (!imageUrl) {
        throw new AppError("Problem occured with image upload process", 500);
      }

      user.imageUrl = imageUrl;
      await user.save({ session: session });
    }
    await createSession(user._id);
  });
  user.password = undefined; // Remove password from user object
  user.__v = undefined; // Remove __v from user object
  user.verified = undefined; // Remove verified from user object
  const userJson = JSON.parse(JSON.stringify(user));
  return { user: userJson, ok: true };
});

export const login = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const email = formData.get("email");
  const password = formData.get("password");

  const user = await User.findOne({ email }).select("+password -__v");

  if (
    !user ||
    user.password === "00000000" ||
    !(await user.isPasswordMatch(user.password, password))
  ) {
    throw new AppError("email or password is invalid.", 401);
  }

  await createSession(user._id);

  user.password = undefined; // Remove password from user object
  const userJson = JSON.parse(JSON.stringify(user));

  return { user: userJson, ok: true };
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
  const user = JSON.parse(JSON.stringify(userJson));
  if (!user) return null;
  return user;
}
export const updateUserData = catchAsyncServerActions(
  async (arrayOfKeysAndValues) => {
    console.log("Updating user data with:", arrayOfKeysAndValues);
    const accessToken = cookies().get("accessToken")?.value;
    if (!accessToken) return null;

    const accessTokenPayload = await decryptAccessToken(accessToken);
    const userId = accessTokenPayload?.userId;
    if (!userId) return null;

    await dbConnect();
    const userDoc = await User.findById(userId).select("-__v");
    if (!userDoc) return null;

    for (const obj of arrayOfKeysAndValues) {
      const [key, value] = Object.entries(obj)[0];
      userDoc[key] = value;
    }

    await userDoc.save();

    const user = JSON.parse(JSON.stringify(userDoc));
    return user;
  }
);
export const sendContactFormMessage = catchAsyncServerActions(
  async (formData) => {
    const { name, email, phone, message } = Object.fromEntries(formData);
    console.log(
      `Contact Form Submission: Name: ${name}, Email: ${email}, Phone: ${phone}, Message: ${message}`
    );
    await sendContactFormEmail({ name, email, phone, message });
  }
);
export async function createOrder(userId, { addressId, paymentMethod }) {
  await dbConnect();

  // Fetch user with cart + address
  const user = await User.findById(userId).populate("cart.product").exec();

  if (!user || user.cart.length === 0) {
    throw new Error("Cart is empty");
  }

  // Pick selected address
  const shippingAddress = user.addresses.id(addressId);
  if (!shippingAddress) {
    throw new Error("Invalid shipping address");
  }

  // Build order items snapshot
  const items = user.cart.map((item) => {
    if (!item.product) throw new Error("Product not found");
    const price = item.product.priceAfterDiscount ?? item.product.price;
    return {
      product: item.product._id,
      quantity: item.quantity,
      price,
    };
  });

  // Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Create order
  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
  });

  // Clear cart
  user.cart = [];
  await user.save();

  // Optional: revalidate orders list
  revalidatePath("/orders");

  // Redirect to order details
  redirect(`/orders/${order._id}`);
}

export const changePassword = catchAsyncServerActions(async (formData) => {
  await dbConnect();
  const currentUser = await getUserFromAccessOrRefreshToken();
  if (!currentUser) return { ok: false, message: "Unauthorized" };

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  console.log("new Password", newPassword);
  const user = await User.findById(currentUser._id).select("+password -__v");
  if (
    !user ||
    user.password === "00000000" ||
    !(await user.isPasswordMatch(user.password, currentPassword))
  ) {
    throw new AppError("email or password is invalid.", 401);
  }
  user.password = newPassword;

  await user.save();
  return { ok: true };
});
