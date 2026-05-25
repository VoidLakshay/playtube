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

  const allowedMimeTypes = [

    "video/mp4",

    "video/webm",

    "video/mkv",
  ];



  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only video files are allowed"
      )
    );
  }
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