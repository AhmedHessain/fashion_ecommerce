"use server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import RefreshToken from "./model/refreshTokenModel";
import dbConnect from "./db";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const accessTokenEncodedKey = new TextEncoder().encode(accessTokenSecret);
const refreshTokenEncodedKey = new TextEncoder().encode(refreshTokenSecret);
const accessTokenExpirationDate = process.env.ACCESS_TOKEN_EXPIRATION_DATE;
const refreshTokenExpirationDate = process.env.REFRESH_TOKEN_EXPIRATION_DATE;

// Encrypt payload into access token
export async function encryptAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpirationDate)
    .sign(accessTokenEncodedKey);
}

// Encrypt payload into refresh token
export async function encryptRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpirationDate)
    .sign(refreshTokenEncodedKey);
}

// Decrypt and verify access token
export async function decryptAccessToken(session = "") {
  try {
    const { payload } = await jwtVerify(session, accessTokenEncodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify access token");
    return null;
  }
}

// Decrypt and verify refresh token
export async function decryptRefreshToken(refreshToken = "") {
  try {
    const { payload } = await jwtVerify(refreshToken, refreshTokenEncodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify refresh token");
    return null;
  }
}

// Create both access and refresh tokens and set them as cookies
export async function createSession(userId) {
  const accessToken = await encryptAccessToken({ userId });
  const refreshToken = await encryptRefreshToken({ userId });

  const accessExpiresAt = new Date(
    Date.now() + parseInt(accessTokenExpirationDate) * 60 * 1000
  );
  const refreshExpiresAt = new Date(
    Date.now() + parseInt(refreshTokenExpirationDate) * 24 * 60 * 60 * 1000
  );

  // Store refresh token in DB
  await dbConnect();

  await RefreshToken.create({
    _id: refreshToken,
    userId,
  });

  cookies().set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    expires: accessExpiresAt,
    sameSite: "lax",
    path: "/",
  });

  cookies().set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    expires: refreshExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// Validate and refresh access token
export async function refreshAccessToken(url) {
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!refreshToken) return null;

  // Find refresh token in DB
  const response = await fetch(`${process.env.HOST}/api/refreshToken`, {
    headers: {
      authorization: `Bearer ${refreshToken}`,
    },
  });

  if (response.status !== 200) {
    await deleteSession();
    return null;
  }

  const { newAccessToken } = await response.json();

  const accessExpiresAt = new Date(
    Date.now() + parseInt(accessTokenExpirationDate) * 60 * 1000
  );

  const options = {
    httpOnly: true,
    secure: true,
    expires: accessExpiresAt,
    sameSite: "lax",
    path: "/",
  };

  if (newAccessToken) {
    if (url) {
      const res = NextResponse.redirect(url);
      res.cookies.set("accessToken", newAccessToken, options);
      return res;
    } else {
      cookies().set("accessToken", newAccessToken, options);
    }
  }
}

// Delete both access and refresh tokens (logging out)
export async function deleteSession() {
  const res = NextResponse.next();
  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");
}
