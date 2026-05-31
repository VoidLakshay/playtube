import { exec } from "child_process";

export const generateThumbnail = (
  inputPath: string,
  outputPath: string
) => {
  return new Promise<void>((resolve, reject) => {

    const command =
      `ffmpeg -i "${inputPath}" -ss 00:00:05 -frames:v 1 "${outputPath}" -y`;

    exec(command, (error) => {

      if (error) {
        reject(error);
        return;
      }

      resolve();
    });

  });
};