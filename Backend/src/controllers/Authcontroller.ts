import type { Request, Response } from "express";

import bcrypt from "bcryptjs";

import crypto from "crypto";

import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";

import uploadOnCloudinary from "../config/cloudinary.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import sendVerificationEmail
from "../utils/sendVerificationEmail.js";
// ---------------- SIGNUP ----------------

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    let photoUrl = "";

    if (req.file) {
      const uploadedUrl = await uploadOnCloudinary(req.file.path);

      photoUrl = uploadedUrl || "";
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password too short",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        userName: username,
        email,
        password: hashedPassword,
        photoUrl,
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // STORE REFRESH TOKEN

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        refreshToken,
      },
    });
    // SEND VERIFICATION EMAIL

await sendVerificationEmail(

  user.id,

  user.email
);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",

      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,

      message: "Signup successful",

      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Signup failed",
    });
  }
};

// ---------------- SIGNIN ----------------

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken({
      id: user.id,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // STORE REFRESH TOKEN

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        refreshToken,
      },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",

      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,

      message: "Signin successful",

      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Signin failed",
    });
  }
};

// ---------------- SIGNOUT ----------------

export const signout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // REMOVE REFRESH TOKEN FROM DB

    if (refreshToken) {
      await prisma.user.updateMany({
        where: {
          refreshToken,
        },

        data: {
          refreshToken: null,
        },
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,

      message: "Signout successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Signout failed",
    });
  }
};

// ---------------- REFRESH ACCESS TOKEN ----------------

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,

      process.env.REFRESH_TOKEN_SECRET!,
    ) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // GENERATE NEW TOKENS

    const newAccessToken = generateAccessToken({
      id: user.id,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
    });

    // TOKEN ROTATION

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        refreshToken: newRefreshToken,
      },
    });

    // SEND NEW COOKIES

    res.cookie(
      "accessToken",

      newAccessToken,

      {
        httpOnly: true,

        secure: false,

        sameSite: "strict",

        maxAge: 15 * 60 * 1000,
      },
    );

    res.cookie(
      "refreshToken",

      newRefreshToken,

      {
        httpOnly: true,

        secure: false,

        sameSite: "strict",

        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return res.status(200).json({
      success: true,

      message: "Token refreshed",
    });
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: "Refresh failed",
    });
  }
};

// ---------------- FORGOT PASSWORD ----------------

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: {
        email,
      },

      data: {
        resetPasswordToken: resetToken,

        resetPasswordExpiry,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,

      message: "Reset link generated",

      resetLink,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Forgot password failed",
    });
  }
};

// ---------------- RESET PASSWORD ----------------

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password too short",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,

        resetPasswordExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        resetPasswordToken: null,

        resetPasswordExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Reset password failed",
    });
  }
};

// ---------------- SEND RESET OTP ----------------

export const sendResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: {
        email,
      },

      data: {
        resetOtp: otp,

        resetOtpExpiry: expiry,
      },
    });

    return res.status(200).json({
      success: true,

      message: "OTP generated",

      otp,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "OTP generation failed",
    });
  }
};

// ---------------- VERIFY RESET OTP ----------------

export const verifyResetOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,

        resetOtp: otp,

        resetOtpExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        resetOtp: null,

        resetOtpExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};
