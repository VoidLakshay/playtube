import fs from "fs";
import path from "path";

import prisma from "../lib/prisma.js";
import uploadOnCloudinary from "../config/cloudinary.js";

import { generateMultiQualityHLS } from "../utils/generateMultiQualityHLS.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";
import { transcodeVideo } from "../utils/transcodeVideo.js";

export const processVideo = async (
  videoId: string,
  videoPath: string,
) => {
  let transcodedPath: string | null = null;
  let hlsFolder: string | null = null;

  try {

    console.log(
      "PROCESSING VIDEO:",
      videoId,
    );

    const absoluteVideoPath =
      videoPath

    console.log(
      "VIDEO PATH:",
      videoPath,
    );

    console.log(
      "ABSOLUTE PATH:",
      absoluteVideoPath,
    );

    console.log(
      "FILE EXISTS:",
      fs.existsSync(
        absoluteVideoPath,
      ),
    );

    // Upload original video to Cloudinary first (don't delete yet, need for transcoding)
    const uploadedVideo = await uploadOnCloudinary(absoluteVideoPath, false);

    if (!uploadedVideo) {
      throw new Error("Failed to upload video to Cloudinary");
    }

    transcodedPath =
      `uploads/transcoded-${Date.now()}.mp4`;

    await transcodeVideo(
      absoluteVideoPath,
      transcodedPath,
    );

    hlsFolder =
      `uploads/hls-${Date.now()}`;

    await generateMultiQualityHLS(
      transcodedPath,
      hlsFolder,
    );

    const duration =
      await getVideoDuration(
        transcodedPath,
      );

    await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        videoUrl: uploadedVideo,
        duration,

        hlsUrl:
          `${hlsFolder}/master.m3u8`,

        transcodingStatus:
          "completed",
      },
    });

    console.log(
      "VIDEO PROCESSING COMPLETED:",
      videoId,
    );

  } catch (error) {

    console.error(
      "VIDEO PROCESSING FAILED:",
      error,
    );

    await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        transcodingStatus:
          "failed",
      },
    });

  } finally {
    // Clean up all local files regardless of success/failure
    try {
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      if (transcodedPath && fs.existsSync(transcodedPath)) {
        fs.unlinkSync(transcodedPath);
      }

      if (hlsFolder && fs.existsSync(hlsFolder)) {
        // Recursively delete HLS folder
        fs.rmSync(hlsFolder, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }
  }
};