import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_FROM"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5000),

  mongodbUri: process.env.MONGODB_URI!,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,

  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",

  refreshTokenDays:
    Number(process.env.REFRESH_TOKEN_DAYS || 30),

  passwordResetMinutes:
    Number(process.env.PASSWORD_RESET_MINUTES || 15),

  emailVerificationMinutes:
    Number(process.env.EMAIL_VERIFICATION_MINUTES || 30),

  appName:
    process.env.APP_NAME || "Fitness App",

  mobileResetUrl:
    process.env.MOBILE_RESET_URL!,

  mobileVerifyUrl:
    process.env.MOBILE_VERIFY_URL!,

  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.MAIL_FROM!
  }
};