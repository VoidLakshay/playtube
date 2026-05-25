import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import upload from "../middleware/videoMulter.js";

import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getShortVideos,
  searchVideos,
  toggleLike,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getLikedVideos,
} from "../controllers/VideoController.js";

const videoRouter = Router();

// ======================================
// UPLOAD VIDEO / SHORT
// ======================================

videoRouter.post(
  "/upload",

  isAuth,

  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },

    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),

  uploadVideo,
);

// ======================================
// SEARCH VIDEOS
// IMPORTANT:
// MUST BE ABOVE "/:id"
// ======================================

videoRouter.get("/search", searchVideos);

// ======================================
// GET ALL NORMAL VIDEOS
// ======================================

videoRouter.get("/", getAllVideos);

// ======================================
// GET LIKED VIDEOS
// ======================================

videoRouter.get(
  "/liked/all",

  isAuth,

  getLikedVideos,
);

// ======================================
// GET SHORTS
// ======================================

videoRouter.get("/shorts", getShortVideos);

// ======================================
// GET SINGLE VIDEO
// ======================================

videoRouter.get("/:id", getVideoById);

// ======================================
// LIKE / UNLIKE VIDEO
// ======================================

videoRouter.post(
  "/like/:videoId",

  isAuth,

  toggleLike,
);

// ======================================
// UPDATE VIDEO
// ======================================

videoRouter.put(
  "/update/:videoId",

  isAuth,

  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),

  updateVideo,
);

// ======================================
// DELETE VIDEO
// ======================================

videoRouter.delete(
  "/delete/:videoId",

  isAuth,

  deleteVideo,
);

// ======================================
// TOGGLE PUBLISH STATUS
// ======================================

videoRouter.patch(
  "/toggle-publish/:videoId",

  isAuth,

  togglePublishStatus,
);

export default videoRouter;
