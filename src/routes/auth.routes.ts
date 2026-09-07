import { Router } from "express";
import { z } from "zod";
import {
  register,
  login,
  refresh,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
  logoutAllController,
  verifyEmailController,
  me,
  changePasswordController
} from "../controllers/auth.controller.js";

import {
  authenticate
} from "../middleware/auth.middleware.js";

import {
  validate
} from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from "../validators/auth.validator.js";

import {
  authRateLimiter
} from "../middleware/rate-limit.middleware.js";

const router =
  Router();

  // signup 
  router.post(
  "/register",

  authRateLimiter,

  validate(
    registerSchema
  ),

  register
);

// login 
router.post(
  "/login",

  authRateLimiter,

  validate(
    loginSchema
  ),

  login
);

//refresh 
router.post(
  "/refresh",

  authRateLimiter,

  validate(
    refreshSchema
  ),

  refresh
);

//forgot password
router.post(
  "/forgot-password",

  authRateLimiter,

  validate(
    forgotPasswordSchema
  ),

  forgotPasswordController
);

//reset password
router.post(
  "/reset-password",

  authRateLimiter,

  validate(
    resetPasswordSchema
  ),

  resetPasswordController
);

//Verify email
router.post(
  "/verify-email",

  authRateLimiter,

  validate(
    z.object({
      token: z.string().min(20)
    })
  ),

  verifyEmailController
);

//Logout
router.post(
  "/logout",

  logoutController
);

// Logout all devices
router.post(
  "/logout-all",

  authenticate,

  logoutAllController
);

//Current user
router.get(
  "/me",

  authenticate,

  me
);

//Change password
router.post(
  "/change-password",

  authenticate,

  validate(
    changePasswordSchema
  ),

  changePasswordController
);

export default router;