import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

function getContentType(fileName: string) {
  if (fileName.endsWith(".m3u8")) {
    return "application/vnd.apple.mpegurl";
  }

  if (fileName.endsWith(".ts")) {
    return "video/mp2t";
  }

  if (fileName.endsWith(".jpg")) {
    return "image/jpeg";
  }

  if (fileName.endsWith(".png")) {
    return "image/png";
  }

  return "application/octet-stream";
}

export async function uploadHLSFolderToS3(
  folderPath: string,
  s3Prefix: string,
) {
  const files = fs.readdirSync(folderPath, {
    recursive: true,
  });

  for (const file of files) {
    const relativePath = file.toString();

    const fullPath = path.join(
      folderPath,
      relativePath,
    );

    if (fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${s3Prefix}/${relativePath.replace(/\\/g, "/")}`,
        Body: fs.createReadStream(fullPath),
        ContentType: getContentType(relativePath),
      }),
    );

    console.log("Uploaded:", relativePath);
  }
}