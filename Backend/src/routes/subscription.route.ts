import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  toggleSubscription,
  getChannelSubscribers,
  checkSubscriptionStatus,
  getMySubscriptions,
} from "../controllers/SubscriptionController.js";

const subscriptionRouter = Router();

// toggle subscribe

subscriptionRouter.post(
  "/toggle/:channelId",

  isAuth,

  toggleSubscription,
);

// get subscribers

subscriptionRouter.get(
  "/channel/:channelId",

  getChannelSubscribers,
);

// check status

subscriptionRouter.get(
  "/status/:channelId",

  isAuth,

  checkSubscriptionStatus,
);

// get my subscriptions

subscriptionRouter.get(
  "/my",

  isAuth,

  getMySubscriptions,
);

export default subscriptionRouter;
