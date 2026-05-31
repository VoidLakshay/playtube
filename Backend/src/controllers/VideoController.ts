import path from "path";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import uploadOnCloudinary from "../config/cloudinary.js";

import type { AuthRequest } from "../middleware/isAuth.js";

import { sendVideoJob } from "../queue/producer.js";

// ======================================================
// UPLOAD VIDEO / SHORT
// ======================================================

export const uploadVideo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { title, description, isShort } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title required",
      });
    }

    // ======================================================
    // CHECK CHANNEL
    // ======================================================

    const channel = await prisma.channel.findUnique({
      where: {
        userId: userId!,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Create channel first",
      });
    }

    // ======================================================
    // FILES
    // ======================================================

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // ======================================================
    // VIDEO VALIDATION
    // ======================================================

    if (!files?.video?.[0]) {
      return res.status(400).json({
        message: "Video required",
      });
    }
    console.log("video path:", files.video[0].path);

   
    // ======================================================
    // THUMBNAIL VALIDATION
    // ======================================================

    if (!files?.thumbnail?.[0]) {
      return res.status(400).json({
        message: "Thumbnail required",
      });
    }

    // ======================================================
    // UPLOAD THUMBNAIL ONLY FIRST (since we need the video file for transcoding)
    // ======================================================

    const uploadedThumbnail = await uploadOnCloudinary(files.thumbnail[0].path);

    if (!uploadedThumbnail) {
      return res.status(500).json({
        message: "Thumbnail upload failed",
      });
    }

    // ======================================================
    // CREATE VIDEO
    // ======================================================
      
    const video = await prisma.video.create({
  data: {
    title,
    description,
    videoUrl: null, // we'll set this after cloudinary upload from worker
    thumbnailUrl: uploadedThumbnail,
   duration: 0,
hlsUrl: null,
transcodingStatus: "processing",
    isShort: isShort === "true",
    aspectRatio: isShort === "true" ? "9:16" : "16:9",
    channelId: channel.id,
  },
});


const absoluteVideoPath =
  path.resolve(
    files.video[0].path,
  );

await sendVideoJob({
  videoId: video.id,
  videoPath: absoluteVideoPath,
});

console.log(
  "VIDEO JOB SENT:",
  video.id,
);

    // ======================================================
    // INCREMENT VIDEO COUNT
    // ======================================================

    await prisma.channel.update({
      where: {
        id: channel.id,
      },

      data: {
        videosCount: {
          increment: 1,
        },
      },
    });

    return res.status(201).json({
      success: true,

      message:
        isShort === "true"
          ? "Short uploaded successfully"
          : "Video uploaded successfully",

      video,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Video upload failed",
    });
  }
};

// ======================================================
// GET NORMAL VIDEOS
// ======================================================

export const getAllVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        isShort: false,
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

            logoUrl: true,

            handle: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,

      videos,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch videos",
    });
  }
};

// ======================================================
// GET SHORTS
// ======================================================

export const getShortVideos = async (_req: Request, res: Response) => {
  try {
    const shorts = await prisma.video.findMany({
      where: {
        isShort: true,
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

    return res.status(200).json({
      success: true,

      shorts,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch shorts",
    });
  }
};

// ======================================================
// GET SINGLE VIDEO
// ======================================================

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // ======================================================
    // FIND VIDEO
    // ======================================================

    const video = await prisma.video.findUnique({
      where: {
        id,
      },

      include: {
        channel: {
          select: {
            id: true,

            channelName: true,

            logoUrl: true,

            subscribersCount: true,

            handle: true,
          },
        },

        comments: {
          include: {
            user: {
              select: {
                id: true,

                userName: true,

                photoUrl: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    // ======================================================
    // INCREMENT VIEWS
    // ======================================================

    await prisma.video.update({
      where: {
        id,
      },

      data: {
        views: {
          increment: 1,
        },
      },
    });

    // ======================================================
    // RECOMMENDED VIDEOS
    // ======================================================

    const recommendedVideos = await prisma.video.findMany({
      where: {
        id: {
          not: id,
        },

        isPublished: true,

        isShort: video.isShort,

        OR: [
          {
            channelId: video.channelId,
          },

          {
            title: {
              contains: video.title.split(" ")[0] || "",

              mode: "insensitive",
            },
          },
        ],
      },

      take: 10,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        channel: {
          select: {
            id: true,

            channelName: true,

            logoUrl: true,

            handle: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,

      video,

      recommendedVideos,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch video",
    });
  }
};

// ======================================================
// TOGGLE LIKE
// ======================================================

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const videoId = req.params.videoId as string;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: userId!,

          videoId,
        },
      },
    });

    // ======================================================
    // UNLIKE
    // ======================================================

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      await prisma.video.update({
        where: {
          id: videoId,
        },

        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return res.status(200).json({
        success: true,

        message: "Video unliked",
      });
    }

    // ======================================================
    // LIKE
    // ======================================================

    await prisma.like.create({
      data: {
        userId: userId!,

        videoId,
      },
    });

    await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,

      message: "Video liked",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Toggle like failed",
    });
  }
};

// ======================================================
// UPDATE VIDEO
// ======================================================

export const updateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const videoId = req.params.videoId as string;

    const { title, description } = req.body;

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },

      include: {
        channel: true,
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    let thumbnailUrl = video.thumbnailUrl;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (files?.thumbnail?.[0]) {
      const uploadedThumbnail = await uploadOnCloudinary(
        files.thumbnail[0].path,
      );

      if (uploadedThumbnail) {
        thumbnailUrl = uploadedThumbnail;
      }
    }

    const updatedVideo = await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        title: title || video.title,

        description: description || video.description,

        thumbnailUrl,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Video updated successfully",

      updatedVideo,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Update video failed",
    });
  }
};

// ======================================================
// DELETE VIDEO
// ======================================================

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const videoId = req.params.videoId as string;

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },

      include: {
        channel: true,
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });

    await prisma.channel.update({
      where: {
        id: video.channelId,
      },

      data: {
        videosCount: {
          decrement: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,

      message: "Video deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Delete video failed",
    });
  }
};

// ======================================================
// TOGGLE PUBLISH STATUS
// ======================================================

export const togglePublishStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const videoId = req.params.videoId as string;

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },

      include: {
        channel: true,
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedVideo = await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        isPublished: !video.isPublished,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Publish status updated",

      updatedVideo,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Toggle publish failed",
    });
  }
};

// ======================================================
// SEARCH VIDEOS
// ======================================================

export const searchVideos = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,

        isShort: false,

        OR: [
          {
            title: {
              contains: query,

              mode: "insensitive",
            },
          },

          {
            description: {
              contains: query,

              mode: "insensitive",
            },
          },
        ],
      },

      skip,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        channel: {
          select: {
            id: true,

            channelName: true,

            logoUrl: true,

            handle: true,
          },
        },
      },
    });

    const totalVideos = await prisma.video.count({
      where: {
        isPublished: true,

        isShort: false,

        OR: [
          {
            title: {
              contains: query,

              mode: "insensitive",
            },
          },

          {
            description: {
              contains: query,

              mode: "insensitive",
            },
          },
        ],
      },
    });

    return res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(totalVideos / limit),

      totalVideos,

      videos,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Search failed",
    });
  }
};

// ======================================================
// GET LIKED VIDEOS
// ======================================================

export const getLikedVideos = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;

    const likedVideos = await prisma.like.findMany({
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

      likedVideos,
    });

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch liked videos",
    });

    return;
  }
};
