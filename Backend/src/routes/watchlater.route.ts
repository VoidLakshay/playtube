import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  toggleWatchLater,
  getWatchLater,
} from "../controllers/WatchLaterController.js";

const watchLaterRouter = Router();

// ======================================
// TOGGLE
// ======================================

watchLaterRouter.post(
  "/:videoId",

  isAuth,

  toggleWatchLater,
);

// ======================================
// GET ALL
// ======================================

watchLaterRouter.get(
  "/",

  isAuth,

  getWatchLater,
);

export default watchLaterRouter;
