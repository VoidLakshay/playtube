import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  createPlaylist,
  getMyPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../controllers/PlaylistController.js";

const playlistRouter = Router();

// ======================================================
// CREATE PLAYLIST
// ======================================================

playlistRouter.post(
  "/create",

  isAuth,

  createPlaylist,
);

// ======================================================
// GET MY PLAYLISTS
// ======================================================

playlistRouter.get(
  "/my-playlists",

  isAuth,

  getMyPlaylists,
);

// ======================================================
// ADD VIDEO
// ======================================================

playlistRouter.post(
  "/add-video",

  isAuth,

  addVideoToPlaylist,
);

// ======================================================
// REMOVE VIDEO
// ======================================================

playlistRouter.delete(
  "/remove-video",

  isAuth,

  removeVideoFromPlaylist,
);

// ======================================================
// DELETE PLAYLIST
// ======================================================

playlistRouter.delete(
  "/:playlistId",

  isAuth,

  deletePlaylist,
);

export default playlistRouter;
