import type { Response } from "express";

import prisma from "../lib/prisma.js";

import uploadOnCloudinary from "../config/cloudinary.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================================
// GET CURRENT USER
// ======================================================

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,

        userName: true,

        email: true,

        photoUrl: true,

        createdAt: true,

        channel: {
          select: {
            id: true,

            channelName: true,

            handle: true,

            logoUrl: true,

            bannerUrl: true,

            subscribersCount: true,

            videosCount: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { userName } = req.body;

    let photoUrl;

    // ======================================================
    // UPLOAD PROFILE IMAGE
    // ======================================================

    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId!,
      },

      data: {
        ...(userName && {
          userName,
        }),

        ...(photoUrl && {
          photoUrl,
        }),
      },

      select: {
        id: true,

        userName: true,

        email: true,

        photoUrl: true,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Profile updated successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Profile update failed",
    });
  }
};
