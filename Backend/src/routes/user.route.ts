import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import upload from "../middleware/ImageMulter.js";

import {
  getCurrentUser,
  updateProfile,
} from "../controllers/Usercontroller.js";

const userRouter = Router();

// current logged in user

userRouter.get(
  "/me",

  isAuth,

  getCurrentUser,
);

// update profile

userRouter.put(
  "/update",

  isAuth,

  upload.single("photo"),

  updateProfile,
);

export default userRouter;
