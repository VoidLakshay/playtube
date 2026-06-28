import fs from "fs";
import path from "path";

import prisma from "../lib/prisma.js";

import { downloadVideoFromS3 } from "../utils/downloadVideoFromS3.js";
import { transcodeVideo } from "../utils/transcodeVideo.js";
import { generateMultiQualityHLS } from "../utils/generateMultiQualityHLS.js";
import { generateSprite } from "../utils/generateSprite.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";

import { uploadHLSFolderToS3 } from "../utils/uploadHLSFolderToS3.js";
import { uploadSpriteToS3 } from "../utils/uploadSpriteToS3.js";

export const processVideo = async (
  videoId: string,
  s3Key: string,
) => {

  const tempFolder = path.join(
    "temp",
    videoId,
  );

  fs.mkdirSync(tempFolder, {
    recursive: true,
  });

  try {

    console.log(
      "===================================",
    );

    console.log(
      "VIDEO PROCESS STARTED",
    );

    console.log(
      "VIDEO ID:",
      videoId,
    );

    console.log(
      "S3 KEY:",
      s3Key,
    );

    const extension =
      path.extname(s3Key);

    const originalVideo =
      path.join(
        tempFolder,
        `original${extension}`,
      );

    const transcodedVideo =
      path.join(
        tempFolder,
        "transcoded.mp4",
      );

    const hlsFolder =
      path.join(
        tempFolder,
        "hls",
      );

    const spritePath =
      path.join(
        tempFolder,
        "sprite.jpg",
      );

    console.log(
      "Downloading Original Video...",
    );

    await downloadVideoFromS3(
      s3Key,
      originalVideo,
    );

    console.log(
      "Original Downloaded",
    );

    await transcodeVideo(
      originalVideo,
      transcodedVideo,
    );

    console.log(
      "Transcoding Completed",
    );

    await generateMultiQualityHLS(
      transcodedVideo,
      hlsFolder,
    );

    console.log(
      "HLS Generated",
    );

    await generateSprite(
      transcodedVideo,
      spritePath,
    );

    console.log(
      "Sprite Generated",
    );

    const duration =
      await getVideoDuration(
        transcodedVideo,
      );

    const hlsPrefix =
      `videos/hls/${videoId}`;

    await uploadHLSFolderToS3(
      hlsFolder,
      hlsPrefix,
    );
        const sprite =
      await uploadSpriteToS3(
        spritePath,
        videoId,
      );

    console.log(
      "Sprite Uploaded",
    );

    const hlsUrl =
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${hlsPrefix}/master.m3u8`;

    await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        duration,

        hlsUrl,

        spriteUrl:
          sprite.url,

        transcodingStatus:
          "completed",
      },
    });

    console.log(
      "DATABASE UPDATED",
    );

    fs.rmSync(
      tempFolder,
      {
        recursive: true,
        force: true,
      },
    );

    console.log(
      "TEMP FILES DELETED",
    );

    console.log(
      "VIDEO PROCESS COMPLETED",
    );

    console.log(
      "===================================",
    );

  } catch (error) {

    console.error(
      "VIDEO PROCESS FAILED:",
      error,
    );

    if (
      fs.existsSync(
        tempFolder,
      )
    ) {

      fs.rmSync(
        tempFolder,
        {
          recursive: true,
          force: true,
        },
      );

    }

    await prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        transcodingStatus:
          "failed",
      },
    });

  }

};