import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// GET SUBSCRIBED FEED
// ======================================

export const getSubscribedFeed = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

    // ======================================
    // GET SUBSCRIPTIONS
    // ======================================

    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
      },

      select: {
        channelId: true,
      },
    });

    const channelIds = subscriptions.map((sub) => sub.channelId);

    // ======================================
    // GET VIDEOS
    // ======================================

    const videos = await prisma.video.findMany({
      where: {
        channelId: {
          in: channelIds,
        },

        isPublished: true,
      },

      orderBy: {
        createdAt: "desc",
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

    res.status(200).json({
      success: true,

      videos,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch feed",
    });

    return;
  }
};

// ======================================
// TRENDING VIDEOS
// ======================================

export const getTrendingVideos = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,

        isShort: false,
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

    // ======================================
    // SCORE SORTING
    // ======================================

    const trendingVideos = videos.sort((a, b) => {
      const scoreA = a.views + a.likesCount * 3;

      const scoreB = b.views + b.likesCount * 3;

      return scoreB - scoreA;
    });

    res.status(200).json({
      success: true,

      videos: trendingVideos,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch trending videos",
    });

    return;
  }
};
