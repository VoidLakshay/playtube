import { exec } from "child_process";

export const transcodeVideo = async (
  inputPath: string,
  outputPath: string,
) => {
  return new Promise<void>((resolve, reject) => {

    const command =
      `ffmpeg -i "${inputPath}" ` +
      `-c:v libx264 ` +
      `-preset fast ` +
      `-crf 23 ` +
      `-vf scale=1280:720 ` +
      `-c:a aac ` +
      `-b:a 128k ` +
      `"${outputPath}" -y`;

    console.log("=================================");
    console.log("FFMPEG STARTED");
    console.log("INPUT :", inputPath);
    console.log("OUTPUT:", outputPath);
    console.log("COMMAND:", command);
    console.log("=================================");

    exec(command, (error, stdout, stderr) => {

      console.log("FFMPEG STDOUT:");
      console.log(stdout);

      console.log("FFMPEG STDERR:");
      console.log(stderr);

      if (error) {
        console.error("FFMPEG ERROR:");
        console.error(error);

        reject(error);
        return;
      }

      console.log("TRANSCODING COMPLETED");

      resolve();
    });
  });
};