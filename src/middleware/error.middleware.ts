import {
  Request,
  Response,
  NextFunction
} from "express";

export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {

  console.error(error);

  switch (error.message) {

    case "EMAIL_ALREADY_EXISTS":

      return res.status(409).json({
        success: false,
        message:
          "Unable to create account"
      });

    case "PHONE_ALREADY_EXISTS":

      return res.status(409).json({
        success: false,
        message:
          "Unable to create account"
      });

    case "INVALID_CREDENTIALS":

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });

    case "ACCOUNT_DISABLED":

      return res.status(403).json({
        success: false,
        message:
          "This account is disabled"
      });

    case "INVALID_CURRENT_PASSWORD":

      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect"
      });

    case "USER_NOT_FOUND":

      return res.status(404).json({
        success: false,
        message:
          "User not found"
      });

    case "INVALID_OR_EXPIRED_TOKEN":

      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token"
      });

    case "INVALID_REFRESH_TOKEN":
    case "REFRESH_TOKEN_REVOKED":
    case "REFRESH_TOKEN_EXPIRED":

      return res.status(401).json({
        success: false,
        message:
          "Session expired. Please login again."
      });

    case "REFRESH_TOKEN_REUSE":

      return res.status(401).json({
        success: false,
        message:
          "Session security violation. Please login again."
      });

    default:

      return res.status(500).json({
        success: false,
        message:
          "Internal server error"
      });
  }
}