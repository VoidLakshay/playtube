import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export async function uploadSpriteToS3(
  spritePath: string,
  videoId: string,
) {
  const key = `videos/sprites/${videoId}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: fs.createReadStream(spritePath),
      ContentType: "image/jpeg",
    }),
  );

  return {
    key,
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
}