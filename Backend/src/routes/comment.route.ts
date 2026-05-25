import { Router } from "express";

import isAuth from "../middleware/isAuth.js";

import {
  createComment,
  getVideoComments,
  deleteComment,
} from "../controllers/CommentController.js";

const commentRouter = Router();

// create comment

commentRouter.post(
  "/create/:videoId",

  isAuth,

  createComment,
);

// get comments

commentRouter.get(
  "/video/:videoId",

  getVideoComments,
);

// delete comment

commentRouter.delete(
  "/:commentId",

  isAuth,

  deleteComment,
);

export default commentRouter;
