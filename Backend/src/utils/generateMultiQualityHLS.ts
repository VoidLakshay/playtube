import { exec } from "child_process";
import fs from "fs";
import path from "path";

const runCommand = (command: string) => {
  return new Promise<void>((resolve, reject) => {
    exec(command, (error, _stdout, stderr) => {

      console.log(stderr);

      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

export const generateMultiQualityHLS = async (
  inputPath: string,
  outputFolder: string,
) => {

  fs.mkdirSync(outputFolder, {
    recursive: true,
  });

  const qualities = [
    {
      name: "360p",
      resolution: "640x360",
      bitrate: "800k",
    },

    {
      name: "720p",
      resolution: "1280x720",
      bitrate: "2800k",
    },

    {
      name: "1080p",
      resolution: "1920x1080",
      bitrate: "5000k",
    },
  ];

  for (const quality of qualities) {

    const qualityFolder = path.join(
      outputFolder,
      quality.name,
    );

    fs.mkdirSync(qualityFolder, {
      recursive: true,
    });

    const command =
      `ffmpeg -i "${inputPath}" ` +
      `-vf scale=${quality.resolution} ` +
      `-c:v libx264 ` +
      `-b:v ${quality.bitrate} ` +
      `-c:a aac ` +
      `-hls_time 10 ` +
      `-hls_playlist_type vod ` +
      `-hls_segment_filename "${qualityFolder}/segment_%03d.ts" ` +
      `"${qualityFolder}/index.m3u8"`;

    console.log(`GENERATING ${quality.name}...`);

    await runCommand(command);
  }

  const masterPlaylist = `#EXTM3U

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8
`;

  fs.writeFileSync(
    path.join(outputFolder, "master.m3u8"),
    masterPlaylist,
  );

  console.log("MASTER PLAYLIST CREATED");
};