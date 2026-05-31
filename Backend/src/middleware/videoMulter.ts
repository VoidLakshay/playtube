import multer from "multer";

import path from "path";

import type {
  Request,
} from "express";

import type {
  FileFilterCallback,
} from "multer";



const storage =
  multer.diskStorage({

    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb
    ) => {

      cb(null, "./public");
    },



    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb
    ) => {

      const uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        );

      const extension =
        path.extname(
          file.originalname
        );

      const fileName =
        file.fieldname +
        "-" +
        uniqueSuffix +
        extension;

      cb(null, fileName);
    },
  });




const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {

  if (file.fieldname === "video") {

    const allowedVideos = [
      "video/mp4",
      "video/webm",
      "video/x-matroska",
    ];

    if (allowedVideos.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only video files are allowed")
    );
  }

  if (file.fieldname === "thumbnail") {

    const allowedImages = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (allowedImages.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only image files are allowed")
    );
  }

  cb(null, false);
};



const videoUpload = multer({

  storage,

  limits: {

    fileSize:
      200 * 1024 * 1024,
  },

  fileFilter,
});



export default videoUpload;