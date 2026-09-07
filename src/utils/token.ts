import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateRandomToken(
  bytes = 32
) {
  return crypto
    .randomBytes(bytes)
    .toString("hex");
}

export function generateRefreshToken() {
  return crypto
    .randomBytes(64)
    .toString("hex");
}

export function hashToken(
  token: string
) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function generateAccessToken(
  userId: string
) {
  return jwt.sign(
    {
      sub: userId,
      type: "access"
    },
    env.jwtAccessSecret,
    {
      expiresIn:
        env.accessTokenExpiresIn as jwt.SignOptions["expiresIn"]
    }
  );
}

export function generateFamilyId() {
  return crypto.randomUUID();
}