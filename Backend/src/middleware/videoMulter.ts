import multer from "multer";
import path from "path";
import fs from "fs";

import type { Request } from "express";
import type { FileFilterCallback } from "multer";

const PUBLIC_DIR = path.resolve(
  process.cwd(),
  "public",
);

fs.mkdirSync(PUBLIC_DIR, {
  recursive: true,
});

const storage = multer.diskStorage({

  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb,
  ) => {

    cb(
      null,
      PUBLIC_DIR,
    );

  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb,
  ) => {

    const uniqueSuffix =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}`;

    const extension =
      path.extname(
        file.originalname,
      );

    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${extension}`,
    );

  },

});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {

  if (file.fieldname === "video") {

    const allowedVideos = [

      "video/mp4",

      "video/webm",

      "video/x-matroska",

      "video/quicktime",

      "video/x-msvideo",

    ];

    if (
      allowedVideos.includes(
        file.mimetype,
      )
    ) {

      return cb(
        null,
        true,
      );

    }

    return cb(
      new Error(
        "Only video files are allowed",
      ),
    );

  }

  if (
    file.fieldname === "thumbnail"
  ) {

    const allowedImages = [

      "image/png",

      "image/jpeg",

      "image/jpg",

      "image/webp",

    ];

    if (
      allowedImages.includes(
        file.mimetype,
      )
    ) {

      return cb(
        null,
        true,
      );

    }

    return cb(
      new Error(
        "Only image files are allowed",
      ),
    );

  }

  cb(
    null,
    false,
  );

};

const videoUpload = multer({

  storage,

  limits: {

    fileSize:
      1024 * 1024 * 1024,

  },

  fileFilter,

});

export default videoUpload;