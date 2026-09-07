import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  registerUser,
  loginUser,
  refreshSession,
  forgotPassword,
  resetPassword,
  logout,
  logoutAllDevices,
  verifyEmail,
  getCurrentUser,
  changePassword
} from "../services/auth.service.js";

import { AuthRequest } from "../middleware/auth.middleware.js";

// register 
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const user =
      await registerUser({
        firstName:
          req.body.firstName,

        lastName:
          req.body.lastName,

        email:
          req.body.email,

        phoneNumber:
          req.body.phoneNumber,

        password:
          req.body.password
      });

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully. Please verify your email.",

      data: {
        id: user.id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        phoneNumber:
          user.phoneNumber,

        isEmailVerified:
          user.isEmailVerified
      }
    });

  } catch (error) {
    next(error);
  }
}

//Login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const result =
      await loginUser(
        req.body.email,
        req.body.password,
        {
          deviceId:
            req.body.deviceId,

          userAgent:
            req.headers["user-agent"],

          ipAddress:
            req.ip
        }
      );

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
}

// Refresh 
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const result =
      await refreshSession(
        req.body.refreshToken,
        {
          deviceId:
            req.body.deviceId,

          userAgent:
            req.headers["user-agent"],

          ipAddress:
            req.ip
        }
      );

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
}

// forgot password
export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await forgotPassword(
      req.body.email
    );

    return res.json({
      success: true,

      message:
        "If an account exists for this email, a password reset link has been sent."
    });

  } catch (error) {
    next(error);
  }
}

//Reset password

export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await resetPassword(
      req.body.token,
      req.body.password
    );

    return res.json({
      success: true,

      message:
        "Password reset successfully. Please login again."
    });

  } catch (error) {
    next(error);
  }
}

//Logout
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await logout(
      req.body.refreshToken
    );

    return res.json({
      success: true,

      message:
        "Logged out successfully"
    });

  } catch (error) {
    next(error);
  }
}

//Logout all
export async function logoutAllController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });
    }

    await logoutAllDevices(
      req.userId
    );

    return res.json({
      success: true,

      message:
        "Logged out from all devices"
    });

  } catch (error) {
    next(error);
  }
}

//Verify email
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await verifyEmail(
      req.body.token
    );

    return res.json({
      success: true,

      message:
        "Email verified successfully"
    });

  } catch (error) {
    next(error);
  }
}

//me
export async function me(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });
    }

    const user =
      await getCurrentUser(
        req.userId
      );

    return res.json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
}

// change password 
export async function changePasswordController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });
    }

    await changePassword(
      req.userId,
      req.body.currentPassword,
      req.body.newPassword
    );

    return res.json({
      success: true,

      message:
        "Password changed successfully. Please login again."
    });

  } catch (error) {
    next(error);
  }
}