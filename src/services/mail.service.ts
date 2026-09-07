import nodemailer from "nodemailer";

import { env } from "../config/env.js";

const transporter =
  nodemailer.createTransport({
    host: env.smtp.host,

    port: env.smtp.port,

    secure:
      env.smtp.port === 465,

    auth: {
      user: env.smtp.user,
      pass: env.smtp.password
    }
  });

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl =
    `${env.mobileResetUrl}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.smtp.from,

    to: email,

    subject:
      "Reset your Fitness App password",

    text: `
You requested to reset your Fitness App password.

Reset your password here:

${resetUrl}

This link expires in ${env.passwordResetMinutes} minutes.

If you did not request this, please ignore this email.
`,

    html: `
      <h2>Reset your password</h2>

      <p>
        You requested to reset your Fitness App password.
      </p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>
        This link expires in
        ${env.passwordResetMinutes}
        minutes.
      </p>

      <p>
        If you did not request this,
        please ignore this email.
      </p>
    `
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verifyUrl =
    `${env.mobileVerifyUrl}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.smtp.from,

    to: email,

    subject:
      "Verify your Fitness App email",

    text: `
Welcome to Fitness App.

Verify your email:

${verifyUrl}

This link expires in
${env.emailVerificationMinutes} minutes.
`,

    html: `
      <h2>Welcome to Fitness App</h2>

      <p>
        Please verify your email address.
      </p>

      <p>
        <a href="${verifyUrl}">
          Verify Email
        </a>
      </p>

      <p>
        This link expires in
        ${env.emailVerificationMinutes}
        minutes.
      </p>
    `
  });
}