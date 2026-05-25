import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  getSubscribedFeed,
  getTrendingVideos,
} from "../controllers/FeedController.js";

const feedRouter = Router();

// ======================================
// SUBSCRIBED FEED
// ======================================

feedRouter.get(
  "/subscriptions",

  isAuth,

  getSubscribedFeed,
);

// ======================================
// TRENDING VIDEOS
// ======================================

feedRouter.get(
  "/trending",

  getTrendingVideos,
);

export default feedRouter;
