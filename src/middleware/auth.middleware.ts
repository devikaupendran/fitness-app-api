import {
  Request,
  Response,
  NextFunction
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AuthRequest
  extends Request {

  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const header =
    req.headers.authorization;

  if (
    !header ||
    !header.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required"
    });
  }

  const token =
    header.substring(7);

  try {

    const decoded =
      jwt.verify(
        token,
        env.jwtAccessSecret
      ) as {
        sub: string;
        type: string;
      };

    if (
      decoded.type !== "access"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid access token"
      });
    }

    req.userId =
      decoded.sub;

    next();

  } catch {

    return res.status(401).json({
      success: false,
      message:
        "Access token expired or invalid"
    });
  }
}