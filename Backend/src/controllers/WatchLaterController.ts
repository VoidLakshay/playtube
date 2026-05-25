import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// TOGGLE WATCH LATER
// ======================================

export const toggleWatchLater = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

    const videoId = req.params.videoId as string;

    const existing = await prisma.watchLater.findUnique({
      where: {
        userId_videoId: {
          userId,

          videoId,
        },
      },
    });

    // ======================================
    // REMOVE FROM WATCH LATER
    // ======================================

    if (existing) {
      await prisma.watchLater.delete({
        where: {
          id: existing.id,
        },
      });

      res.status(200).json({
        success: true,

        saved: false,

        message: "Removed from watch later",
      });

      return;
    }

    // ======================================
    // ADD TO WATCH LATER
    // ======================================

    await prisma.watchLater.create({
      data: {
        userId,

        videoId,
      },
    });

    res.status(200).json({
      success: true,

      saved: true,

      message: "Added to watch later",
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Watch later failed",
    });

    return;
  }
};

// ======================================
// GET WATCH LATER VIDEOS
// ======================================

export const getWatchLater = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

    const videos = await prisma.watchLater.findMany({
      where: {
        userId,
      },

      include: {
        video: {
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
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,

      videos,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch watch later",
    });

    return;
  }
};
