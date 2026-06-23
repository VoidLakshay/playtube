import { exec } from "child_process";

export const generateSprite = (
  inputPath: string,
  outputPath: string,
) => {
  return new Promise<void>(
    (resolve, reject) => {

      const command =
        `ffmpeg -i "${inputPath}" ` +
        `-vf "fps=1,scale=160:90,tile=10x10" ` +
        `"${outputPath}"`;

      exec(
        command,
        (error) => {

          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    },
  );
};