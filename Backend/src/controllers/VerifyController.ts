import type {
  Request,
  Response,
} from "express";

import prisma
from "../lib/prisma.js";



export const verifyEmail =
async (
  req: Request,
  res: Response
) => {

  try {

    const tokenRaw = req.params.token;
    const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

    if (!token) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // ======================================
    // FIND USER
    // ======================================

    const user =
      await prisma.user.findFirst({

        where: {

          emailVerifyToken:
            token,

          emailVerifyExpiry: {

            gt: new Date(),
          },
        },
      });

    if (!user) {

      return res.status(400)
      .json({

        message:
          "Invalid or expired token",
      });
    }

    // ======================================
    // VERIFY USER
    // ======================================

    await prisma.user.update({

      where: {
        id: user.id,
      },

      data: {

        isVerified: true,

        emailVerifyToken: null,

        emailVerifyExpiry: null,
      },
    });

    return res.status(200)
    .json({

      success: true,

      message:
        "Email verified successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500)
    .json({

      message:
        "Verification failed",
    });
  }
};