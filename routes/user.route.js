import { Router } from "express";
import {
  validateSignup,
  verifyAccessToken,
  verifyAccessTokenForLogout,
  verifyRefreshToken,
} from "../middlewares/validation.middleware.js";
import {
  signupMiddleware,
  signinMiddleware,
  forgotPasswordMiddleware,
  resetPasswordMiddleware,
  verifyEmailFinalizeMiddleware,
} from "../middlewares/user.middleware.js";
import {
  signup_controller,
  signin_controller,
  signout_controller,
  refresh_controller,
  get_user_controller,
  forgot_password_controller,
  reset_password_controller,
  verify_email_initialize_controller,
  verify_email_finalize_controller,
} from "../controllers/user.controller.js";
import {
  sendForgotPasswordMail,
  sendVerifyUserMail,
} from "../utils/sendMail.js";

const router = Router();

router.post("/signup", validateSignup, signupMiddleware, signup_controller);
router.post("/signin", signinMiddleware, signin_controller);

router.get("/get-user-details", verifyAccessToken, get_user_controller);
router.post("/signout", verifyAccessTokenForLogout, signout_controller);
router.post("/refresh", verifyRefreshToken, refresh_controller);
router.post(
  "/forgot-password",
  forgotPasswordMiddleware,
  sendForgotPasswordMail,
  forgot_password_controller
);
router.post(
  "/verify-email-initialize",
  verifyAccessToken,
  sendVerifyUserMail,
  verify_email_initialize_controller
);
router.post(
  "/reset-password",
  resetPasswordMiddleware,
  reset_password_controller
);
router.post(
  "/verify-email-finalize",
  verifyEmailFinalizeMiddleware,
  verify_email_finalize_controller
);

export default router;
