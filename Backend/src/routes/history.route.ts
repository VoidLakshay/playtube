import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  addToWatchHistory,
  getWatchHistory,
  clearWatchHistory,
  getContinueWatching,
} from "../controllers/HistoryController.js";

const historyRouter = Router();

// ======================================
// ADD HISTORY
// ======================================

historyRouter.post(
  "/:videoId",

  isAuth,

  addToWatchHistory,
);

// ======================================
// GET HISTORY
// ======================================

historyRouter.get(
  "/",

  isAuth,

  getWatchHistory,
);

// ======================================
// CLEAR HISTORY
// ======================================

historyRouter.delete(
  "/clear",

  isAuth,

  clearWatchHistory,
);
historyRouter.get(
  "/continue-watching",

  isAuth,

  getContinueWatching,
);
export default historyRouter;
