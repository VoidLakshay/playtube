import fs from "fs";
import path from "path";
import { generateSprite } from "../utils/generateSprite.js";
import prisma from "../lib/prisma.js";

import { generateMultiQualityHLS } from "../utils/generateMultiQualityHLS.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";
import { transcodeVideo } from "../utils/transcodeVideo.js";

export const processVideo = async (
  videoId: string,
  videoPath: string,
) => {
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

    const transcodedPath =
      `uploads/transcoded-${Date.now()}.mp4`;

    await transcodeVideo(
      absoluteVideoPath,
      transcodedPath,
    );

    const hlsFolder =
      `uploads/hls-${Date.now()}`;

    await generateMultiQualityHLS(
      transcodedPath,
      hlsFolder,
    );
    const spritePath =
  `uploads/sprite-${Date.now()}.jpg`;

await generateSprite(
  transcodedPath,
  spritePath,
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
  duration,

  hlsUrl:
    `${hlsFolder}/master.m3u8`,

  spriteUrl:
    spritePath,

  transcodingStatus:
    "completed",
}
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

  }
};