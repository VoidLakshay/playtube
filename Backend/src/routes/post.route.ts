import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import upload from "../middleware/ImageMulter.js";

import { createPost, getChannelPosts } from "../controllers/PostController.js";

const postRouter = Router();

// ======================================
// CREATE POST
// ======================================

postRouter.post(
  "/create",

  isAuth,

  upload.single("image"),

  createPost,
);

// ======================================
// GET CHANNEL POSTS
// ======================================

postRouter.get(
  "/:handle",

  getChannelPosts,
);

export default postRouter;
