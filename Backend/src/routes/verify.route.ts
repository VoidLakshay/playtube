import express
from "express";

import {
  verifyEmail,
}
from "../controllers/VerifyController.js";

const router =
  express.Router();

router.get(
  "/:token",
  verifyEmail
);

export default
router;