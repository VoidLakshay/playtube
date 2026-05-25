import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import uploadOnCloudinary from "../config/cloudinary.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// CREATE POST
// ======================================

export const createPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

    const { content } = req.body;

    const file = req.file;

    const channel = await prisma.channel.findUnique({
      where: {
        userId,
      },
    });

    if (!channel) {
      res.status(404).json({
        message: "Channel not found",
      });

      return;
    }

    let imageUrl = "";

    // ======================================
    // IMAGE UPLOAD
    // ======================================

    if (file) {
      const uploadedImage = await uploadOnCloudinary(file.path);

      imageUrl = uploadedImage || "";
    }

    const post = await prisma.post.create({
      data: {
        content,

        imageUrl,

        channelId: channel.id,
      },

      include: {
        channel: {
          select: {
            id: true,

            channelName: true,

            handle: true,

            logoUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,

      message: "Post created successfully",

      post,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Create post failed",
    });

    return;
  }
};

// ======================================
// GET CHANNEL POSTS
// ======================================

export const getChannelPosts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const handle = req.params.handle as string;

    const channel = await prisma.channel.findUnique({
      where: {
        handle,
      },
    });

    if (!channel) {
      res.status(404).json({
        message: "Channel not found",
      });

      return;
    }

    const posts = await prisma.post.findMany({
      where: {
        channelId: channel.id,
      },

      include: {
        channel: {
          select: {
            id: true,

            channelName: true,

            handle: true,

            logoUrl: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,

      posts,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch posts",
    });

    return;
  }
};
