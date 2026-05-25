import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================
// CREATE COMMENT
// ======================================

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const videoId = req.params.videoId as string;

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text required",
      });
    }

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

    const comment = await prisma.comment.create({
      data: {
        text,

        userId: userId!,

        videoId,
      },

      include: {
        user: {
          select: {
            id: true,

            userName: true,

            photoUrl: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,

      message: "Comment added",

      comment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Create comment failed",
    });
  }
};

// ======================================
// GET VIDEO COMMENTS
// ======================================

export const getVideoComments = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId as string;

    const comments = await prisma.comment.findMany({
      where: {
        videoId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
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

      comments,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Fetch comments failed",
    });
  }
};

// ======================================
// DELETE COMMENT
// ======================================

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const commentId = req.params.commentId as string;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Comment deleted",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Delete comment failed",
    });
  }
};
