import { exec } from "child_process";

export const getVideoDuration = async (
  videoPath: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {

    const command =
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;

    exec(command, (error, stdout) => {

      if (error) {
        reject(error);
        return;
      }

      const duration = Math.floor(
        Number(stdout.trim()),
      );

      resolve(duration);
    });
  });
};