import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import uploadOnCloudinary from "../config/cloudinary.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================================
// CREATE CHANNEL
// ======================================================

export const createChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { channelName, handle, description } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    let logoUrl = "";

    let bannerUrl = "";

    // ======================================================
    // VALIDATION
    // ======================================================

    if (!channelName || !handle) {
      return res.status(400).json({
        message: "Channel name and handle required",
      });
    }

    // ======================================================
    // CHECK EXISTING CHANNEL
    // ======================================================

    const existingChannel = await prisma.channel.findUnique({
      where: {
        userId: userId!,
      },
    });

    if (existingChannel) {
      return res.status(400).json({
        message: "User already has a channel",
      });
    }

    // ======================================================
    // CHECK HANDLE
    // ======================================================

    const existingHandle = await prisma.channel.findUnique({
      where: {
        handle,
      },
    });

    if (existingHandle) {
      return res.status(400).json({
        message: "Handle already taken",
      });
    }

    // ======================================================
    // LOGO UPLOAD
    // ======================================================

    if (files?.logo?.[0]) {
      const uploadedLogo = await uploadOnCloudinary(files.logo[0].path);

      logoUrl = uploadedLogo || "";
    }

    // ======================================================
    // BANNER UPLOAD
    // ======================================================

    if (files?.banner?.[0]) {
      const uploadedBanner = await uploadOnCloudinary(files.banner[0].path);

      bannerUrl = uploadedBanner || "";
    }

    // ======================================================
    // CREATE CHANNEL
    // ======================================================

    const channel = await prisma.channel.create({
      data: {
        channelName,

        handle,

        description,

        logoUrl,

        bannerUrl,

        userId: userId!,
      },
    });

    return res.status(201).json({
      success: true,

      message: "Channel created successfully",

      channel,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Create channel failed",
    });
  }
};

// ======================================================
// UPDATE CHANNEL
// ======================================================

export const updateChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { channelName, description } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const channel = await prisma.channel.findUnique({
      where: {
        userId: userId!,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    let logoUrl = channel.logoUrl;

    let bannerUrl = channel.bannerUrl;

    // ======================================================
    // UPDATE LOGO
    // ======================================================

    if (files?.logo?.[0]) {
      const uploadedLogo = await uploadOnCloudinary(files.logo[0].path);

      logoUrl = uploadedLogo || channel.logoUrl;
    }

    // ======================================================
    // UPDATE BANNER
    // ======================================================

    if (files?.banner?.[0]) {
      const uploadedBanner = await uploadOnCloudinary(files.banner[0].path);

      bannerUrl = uploadedBanner || channel.bannerUrl;
    }

    // ======================================================
    // UPDATE CHANNEL
    // ======================================================

    const updatedChannel = await prisma.channel.update({
      where: {
        userId: userId!,
      },

      data: {
        channelName: channelName || channel.channelName,

        description: description || channel.description,

        logoUrl,

        bannerUrl,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Channel updated successfully",

      updatedChannel,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Update channel failed",
    });
  }
};

// ======================================================
// GET CHANNEL BY HANDLE
// ======================================================

export const getChannelByHandle = async (req: Request, res: Response) => {
  try {
    const handle = req.params.handle as string;

    const channel = await prisma.channel.findUnique({
      where: {
        handle,
      },

      include: {
        user: {
          select: {
            id: true,

            userName: true,

            photoUrl: true,
          },
        },

        videos: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    // ======================================================
    // SEPARATE VIDEOS & SHORTS
    // ======================================================

    const normalVideos = channel.videos.filter((video) => !video.isShort);

    const shorts = channel.videos.filter((video) => video.isShort);

    return res.status(200).json({
      success: true,

      channel: {
        id: channel.id,

        channelName: channel.channelName,

        handle: channel.handle,

        description: channel.description,

        logoUrl: channel.logoUrl,

        bannerUrl: channel.bannerUrl,

        subscribersCount: channel.subscribersCount,

        videosCount: channel.videosCount,

        createdAt: channel.createdAt,

        owner: channel.user,

        videos: normalVideos,

        shorts,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Fetch channel failed",
    });
  }
};
