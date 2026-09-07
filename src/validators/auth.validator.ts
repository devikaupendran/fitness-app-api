import { z } from "zod";

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must contain at least 8 characters"
  )
  .max(
    128,
    "Password is too long"
  );

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Invalid phone number")
  .max(20, "Invalid phone number");

export const registerSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    email: z
      .string()
      .email()
      .max(255),

    phoneNumber: phoneSchema,

    password: passwordSchema,

    confirmPassword: z
      .string()
  })
  .refine(
    data =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    }
  );

export const loginSchema =
  z.object({
    email: z
      .string()
      .email(),

    password: z
      .string()
      .min(1),

    deviceId: z
      .string()
      .max(255)
      .optional()
  });

export const refreshSchema =
  z.object({
    refreshToken: z
      .string()
      .min(20),

    deviceId: z
      .string()
      .max(255)
      .optional()
  });

export const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .email()
  });

export const resetPasswordSchema =
  z.object({
    token: z
      .string()
      .min(20),

    password: passwordSchema,

    confirmPassword: z
      .string()
  })
  .refine(
    data =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    }
  );

export const changePasswordSchema =
  z.object({
    currentPassword: z
      .string()
      .min(1),

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
  })
  .refine(
    data =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    }
  );