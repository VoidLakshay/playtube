import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,

  api_key: process.env.CLOUD_API_KEY!,

  api_secret: process.env.CLOUD_API_SECRET!,
});

const uploadOnCloudinary = async (filePath: string): Promise<string | null> => {
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

    // delete local temp file

    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.log(error);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
};

export default uploadOnCloudinary;
