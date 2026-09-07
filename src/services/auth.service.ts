import { User, IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";

import {
  hashPassword,
  verifyPassword
} from "../utils/password.js";

import {
  generateAccessToken,
  generateRandomToken,
  generateRefreshToken,
  hashToken,
  generateFamilyId
} from "../utils/token.js";

import {
  sendPasswordResetEmail,
  sendVerificationEmail
} from "./mail.service.js";

import { env } from "../config/env.js";

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface SessionMetadata {
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: RegisterUserInput): Promise<UserResponse> {
  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedPhone = input.phoneNumber.trim();

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const existingPhone = await User.findOne({ phoneNumber: normalizedPhone });
  if (existingPhone) {
    throw new Error("PHONE_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const rawVerificationToken = generateRandomToken(32);
  const emailVerificationTokenHash = hashToken(rawVerificationToken);
  const emailVerificationExpiresAt = new Date(
    Date.now() + env.emailVerificationMinutes * 60 * 1000
  );

  const user = await User.create({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    passwordHash,
    emailVerificationTokenHash,
    emailVerificationExpiresAt
  });

  try {
    await sendVerificationEmail(user.email, rawVerificationToken);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    isEmailVerified: user.isEmailVerified
  };
}

export async function loginUser(
  email: string,
  password: string,
  metadata?: SessionMetadata
): Promise<AuthResponse> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const familyId = generateFamilyId();
  const expiresAt = new Date(
    Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    familyId,
    expiresAt,
    deviceId: metadata?.deviceId,
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress
  });

  const userData: UserResponse = {
    id: userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    isEmailVerified: user.isEmailVerified
  };

  return {
    user: userData,
    tokens: {
      accessToken,
      refreshToken: rawRefreshToken
    },
    accessToken,
    refreshToken: rawRefreshToken
  };
}

export async function refreshSession(
  refreshToken: string,
  metadata?: SessionMetadata
): Promise<AuthResponse> {
  if (!refreshToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const incomingTokenHash = hashToken(refreshToken);
  const existingToken = await RefreshToken.findOne({ tokenHash: incomingTokenHash });

  if (!existingToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  if (existingToken.replacedByTokenHash) {
    await RefreshToken.updateMany(
      { familyId: existingToken.familyId },
      { revokedAt: new Date() }
    );
    throw new Error("REFRESH_TOKEN_REUSE");
  }

  if (existingToken.revokedAt) {
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  if (existingToken.expiresAt < new Date()) {
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }

  const user = await User.findById(existingToken.userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);
  const newExpiresAt = new Date(
    Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000
  );

  existingToken.revokedAt = new Date();
  existingToken.replacedByTokenHash = newTokenHash;
  await existingToken.save();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: newTokenHash,
    familyId: existingToken.familyId,
    expiresAt: newExpiresAt,
    deviceId: metadata?.deviceId || existingToken.deviceId,
    userAgent: metadata?.userAgent || existingToken.userAgent,
    ipAddress: metadata?.ipAddress || existingToken.ipAddress
  });

  const accessToken = generateAccessToken(user._id.toString());

  const userData: UserResponse = {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    isEmailVerified: user.isEmailVerified
  };

  return {
    user: userData,
    tokens: {
      accessToken,
      refreshToken: newRawRefreshToken
    },
    accessToken,
    refreshToken: newRawRefreshToken
  };
}

export async function forgotPassword(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.isActive) {
    return;
  }

  const rawToken = generateRandomToken(32);
  const resetTokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.passwordResetMinutes * 60 * 1000
  );

  user.passwordResetTokenHash = resetTokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const incomingTokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: incomingTokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  }).select("+passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  user.passwordHash = await hashPassword(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function logout(refreshToken: string): Promise<void> {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash });

  if (tokenDoc && !tokenDoc.revokedAt) {
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();
  }
}

export async function logoutAllDevices(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function verifyEmail(token: string): Promise<void> {
  const incomingTokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: incomingTokenHash,
    emailVerificationExpiresAt: { $gt: new Date() }
  }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const isCurrentValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!isCurrentValid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );
}