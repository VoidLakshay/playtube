import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// ADD TO WATCH HISTORY
// ======================================

export const addToWatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const videoId = req.params.videoId as string;

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    // already exists

    const existingHistory = await prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,

          videoId,
        },
      },
    });

    // if exists update time

    if (existingHistory) {
      await prisma.watchHistory.update({
        where: {
          id: existingHistory.id,
        },

        data: {
          watchedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,

        message: "History updated",
      });
    }

    // create new history

    await prisma.watchHistory.create({
      data: {
        userId,

        videoId,
      },
    });

    return res.status(201).json({
      success: true,

      message: "Added to watch history",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Add history failed",
    });
  }
};

// ======================================
// GET WATCH HISTORY
// ======================================

export const getWatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const history = await prisma.watchHistory.findMany({
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
        watchedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,

      history,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Fetch history failed",
    });
  }
};

// ======================================
// CLEAR WATCH HISTORY
// ======================================

export const clearWatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.watchHistory.deleteMany({
      where: {
        userId,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Watch history cleared",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Clear history failed",
    });
  }
};
export const getContinueWatching = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;

    const history = await prisma.watchHistory.findMany({
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
        watchedAt: "desc",
      },

      take: 20,
    });

    res.status(200).json({
      success: true,

      videos: history,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch continue watching",
    });

    return;
  }
};
