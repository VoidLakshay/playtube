import { Router } from "express";

import passport from "../config/passport.js";

import upload from "../middleware/ImageMulter.js";

import isAuth from "../middleware/isAuth.js";

import {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  sendResetOtp,
  verifyResetOtp,
  refreshAccessToken,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/Authcontroller.js";
import { getCurrentUser } from "../controllers/Usercontroller.js";

const authRouter = Router();

// ---------- NORMAL AUTH ----------

authRouter.post(
  "/signup",

  upload.single("photo"),

  signup,
);
authRouter.post(
  "/refresh-token",

  refreshAccessToken,
);
authRouter.get("/verify/:token", verifyEmail);

authRouter.post(
  "/signin",

  signin,
);

authRouter.post(
  "/signout",

  signout,
);
authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);

authRouter.post("/send-reset-otp", sendResetOtp);

authRouter.post("/verify-reset-otp", verifyResetOtp);

// ---------- CURRENT USER ----------

authRouter.get(
  "/me",

  isAuth,

  getCurrentUser,
);

// ---------- GOOGLE AUTH ----------

authRouter.get(
  "/google",
  (req, res, next) => {
    console.log("========== GOOGLE LOGIN ==========");
    console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// ---------- GOOGLE CALLBACK ----------

authRouter.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,

    failureRedirect: process.env.FRONTEND_URL || "http://localhost:5173/login",
  }),

  (req, res) => {
    const data = req.user as any;

    // Store tokens in cookies
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend home page
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  },
);

export default authRouter;
