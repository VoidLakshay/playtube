import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import upload from "../middleware/ImageMulter.js";

import {
  createChannel,
  updateChannel,
  getChannelByHandle,
} from "../controllers/Channelcontroller.js";

const channelRouter = Router();

// ======================================================
// CREATE CHANNEL
// ======================================================

channelRouter.post(
  "/create",

  isAuth,

  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },

    {
      name: "banner",
      maxCount: 1,
    },
  ]),

  createChannel,
);

// ======================================================
// UPDATE CHANNEL
// ======================================================

channelRouter.put(
  "/update",

  isAuth,

  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },

    {
      name: "banner",
      maxCount: 1,
    },
  ]),

  updateChannel,
);

// ======================================================
// GET CHANNEL BY HANDLE
// ======================================================

channelRouter.get("/:handle", getChannelByHandle);

export default channelRouter;
