import { v2 as cloudinary } from "cloudinary";

import fs from "fs";


console.log("CLOUD_NAME =", process.env.CLOUD_NAME);
console.log("CLOUD_API_KEY =", process.env.CLOUD_API_KEY);
console.log("CLOUD_API_SECRET =", process.env.CLOUD_API_SECRET ? "FOUND" : "MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,

  api_key: process.env.CLOUD_API_KEY!,

  api_secret: process.env.CLOUD_API_SECRET!,
});

const uploadOnCloudinary = async (filePath: string, deleteAfterUpload: boolean = true): Promise<string | null> => {
  try {
    if (!filePath) {
      return null;
    }

    const result = await cloudinary.uploader.upload(
      filePath,

      {
        folder: "playtube/channels",

        resource_type: "auto",
      },
    );

    // delete local temp file if requested
    if (deleteAfterUpload) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    console.log(error);

    if (filePath && fs.existsSync(filePath) && deleteAfterUpload) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
};

export default uploadOnCloudinary;
