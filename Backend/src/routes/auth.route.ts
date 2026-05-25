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

  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// ---------- GOOGLE CALLBACK ----------

authRouter.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,

    failureRedirect: "/login",
  }),

  (req, res) => {
    const data = req.user as any;

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,

      user: data.user,

      accessToken: data.accessToken,

      refreshToken: data.refreshToken,
    });
  },
);

export default authRouter;
