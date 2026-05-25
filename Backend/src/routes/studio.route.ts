import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import { getStudioDashboard } from "../controllers/StudioController.js";

const studioRouter = Router();

// ======================================
// STUDIO DASHBOARD
// ======================================

studioRouter.get(
  "/dashboard",

  isAuth,

  getStudioDashboard,
);

export default studioRouter;
