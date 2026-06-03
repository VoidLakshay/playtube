import fs from "fs";

import prisma from "../lib/prisma.js";
import { uploadHLSFolderToS3 } from "../utils/uploadHLSFolderToS3.js";
import { uploadVideoToS3 } from "../utils/uploadVideoToS3.js";

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
    console.log("PROCESSING VIDEO:", videoId);

    const absoluteVideoPath = videoPath;

    const uploadedVideo = await uploadVideoToS3(
      absoluteVideoPath,
      videoId,
    );

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

    await uploadHLSFolderToS3(
      hlsFolder,
      `videos/${videoId}`,
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
        videoUrl: uploadedVideo.url,

        hlsUrl:
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${videoId}/master.m3u8`,

        duration,

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
    try {
      if (
        videoPath &&
        fs.existsSync(videoPath)
      ) {
        fs.unlinkSync(videoPath);
      }

      if (
        transcodedPath &&
        fs.existsSync(transcodedPath)
      ) {
        fs.unlinkSync(transcodedPath);
      }

      if (
        hlsFolder &&
        fs.existsSync(hlsFolder)
      ) {
        fs.rmSync(
          hlsFolder,
          {
            recursive: true,
            force: true,
          },
        );
      }
    } catch (cleanupError) {
      console.error(
        "Cleanup failed:",
        cleanupError,
      );
    }
  }
};