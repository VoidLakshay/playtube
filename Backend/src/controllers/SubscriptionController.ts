import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// TOGGLE SUBSCRIBE
// ======================================

export const toggleSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const channelId = req.params.channelId as string;

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    // prevent self subscribe

    if (channel.userId === userId) {
      return res.status(400).json({
        message: "Cannot subscribe your own channel",
      });
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: userId!,

          channelId,
        },
      },
    });

    // ======================================
    // UNSUBSCRIBE
    // ======================================

    if (existingSubscription) {
      await prisma.subscription.delete({
        where: {
          id: existingSubscription.id,
        },
      });

      await prisma.channel.update({
        where: {
          id: channelId,
        },

        data: {
          subscribersCount: {
            decrement: 1,
          },
        },
      });

      return res.status(200).json({
        success: true,

        subscribed: false,

        message: "Unsubscribed successfully",
      });
    }

    // ======================================
    // SUBSCRIBE
    // ======================================

    await prisma.subscription.create({
      data: {
        subscriberId: userId!,

        channelId,
      },
    });

    await prisma.channel.update({
      where: {
        id: channelId,
      },

      data: {
        subscribersCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,

      subscribed: true,

      message: "Subscribed successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Subscription failed",
    });
  }
};

// ======================================
// GET CHANNEL SUBSCRIBERS
// ======================================

export const getChannelSubscribers = async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channelId as string;

    const subscribers = await prisma.subscription.findMany({
      where: {
        channelId,
      },

      include: {
        subscriber: {
          select: {
            id: true,

            userName: true,

            photoUrl: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,

      subscribers,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Fetch subscribers failed",
    });
  }
};

// ======================================
// CHECK SUBSCRIBED STATUS
// ======================================

export const checkSubscriptionStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    const channelId = req.params.channelId as string;

    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: userId!,

          channelId,
        },
      },
    });

    return res.status(200).json({
      success: true,

      subscribed: !!subscription,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Check subscription failed",
    });
  }
};
