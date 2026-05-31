import { exec } from "child_process";
import fs from "fs";

export const generateHLS = async (
  inputPath: string,
  outputFolder: string,
) => {
  return new Promise<void>((resolve, reject) => {

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, {
        recursive: true,
      });
    }

    const command =
      `ffmpeg -i "${inputPath}" ` +
      `-c:v libx264 ` +
      `-c:a aac ` +
      `-hls_time 10 ` +
      `-hls_playlist_type vod ` +
      `-hls_segment_filename "${outputFolder}/segment_%03d.ts" ` +
      `"${outputFolder}/master.m3u8"`;

    console.log("HLS COMMAND:");
    console.log(command);

    exec(command, (error, stdout, stderr) => {

      console.log(stderr);

      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};