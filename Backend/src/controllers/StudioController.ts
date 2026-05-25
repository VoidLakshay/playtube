import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// GET STUDIO DASHBOARD
// ======================================

export const getStudioDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

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

    const videos = await prisma.video.findMany({
      where: {
        channelId: channel.id,
      },
    });

    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

    const totalLikes = videos.reduce((acc, video) => acc + video.likesCount, 0);

    res.status(200).json({
      success: true,

      dashboard: {
        totalVideos: videos.length,

        totalViews,

        totalLikes,

        subscribers: channel.subscribersCount,
      },
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch dashboard",
    });

    return;
  }
};
