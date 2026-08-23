import { SignJWT, jwtVerify } from "jose";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const accessTokenEncodedKey = new TextEncoder().encode(accessTokenSecret);
const refreshTokenEncodedKey = new TextEncoder().encode(refreshTokenSecret);

const accessTokenExpirationDate = process.env.ACCESS_TOKEN_EXPIRATION_DATE;

const refreshTokenExpirationDate = process.env.REFRESH_TOKEN_EXPIRATION_DATE;

// Create access token
export async function encryptAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpirationDate)
    .sign(accessTokenEncodedKey);
}

// Create refresh token
export async function encryptRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpirationDate)
    .sign(refreshTokenEncodedKey);
}

// Verify access token
export async function decryptAccessToken(session = "") {
  try {
    const { payload } = await jwtVerify(session, accessTokenEncodedKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch {
    return null;
  }
}

// Verify refresh token
export async function decryptRefreshToken(refreshToken = "") {
  try {
    const { payload } = await jwtVerify(refreshToken, refreshTokenEncodedKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch {
    return null;
  }
}
