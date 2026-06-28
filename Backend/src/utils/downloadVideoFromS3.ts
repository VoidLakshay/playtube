import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export async function downloadVideoFromS3(
  key: string,
  outputPath: string,
) {
  const directory = path.dirname(outputPath);

  fs.mkdirSync(directory, {
    recursive: true,
  });

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("S3 returned empty body.");
  }

  await pipeline(
    response.Body as NodeJS.ReadableStream,
    fs.createWriteStream(outputPath),
  );

  return outputPath;
}
