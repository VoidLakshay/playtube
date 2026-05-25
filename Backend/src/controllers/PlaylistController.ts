import type { Request, Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/isAuth.js";

// ======================================================
// CREATE PLAYLIST
// ======================================================

export const createPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Playlist name required",
      });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,

        description,

        userId: userId!,
      },
    });

    return res.status(201).json({
      success: true,

      message: "Playlist created successfully",

      playlist,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Create playlist failed",
    });
  }
};

// ======================================================
// GET MY PLAYLISTS
// ======================================================

export const getMyPlaylists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: userId!,
      },

      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,

      playlists,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Fetch playlists failed",
    });
  }
};

// ======================================================
// ADD VIDEO TO PLAYLIST
// ======================================================

export const addVideoToPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { playlistId, videoId } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    // ownership check

    if (playlist.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // already exists check

    const existingVideo = await prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,

          videoId,
        },
      },
    });

    if (existingVideo) {
      return res.status(400).json({
        message: "Video already added",
      });
    }

    await prisma.playlistVideo.create({
      data: {
        playlistId,

        videoId,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Video added to playlist",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Add video failed",
    });
  }
};

// ======================================================
// REMOVE VIDEO FROM PLAYLIST
// ======================================================

export const removeVideoFromPlaylist = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    const { playlistId, videoId } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    // ownership check

    if (playlist.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await prisma.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,

          videoId,
        },
      },
    });

    return res.status(200).json({
      success: true,

      message: "Video removed from playlist",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Remove video failed",
    });
  }
};

// ======================================================
// DELETE PLAYLIST
// ======================================================

export const deletePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const playlistId = req.params.playlistId as string;

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    // ownership check

    if (playlist.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Delete playlist failed",
    });
  }
};
