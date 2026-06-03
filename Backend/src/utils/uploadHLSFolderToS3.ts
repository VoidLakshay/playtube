import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export async function uploadHLSFolderToS3(
  folderPath: string,
  s3Prefix: string
) {
  const files = fs.readdirSync(folderPath, {
    recursive: true,
  });

  for (const file of files) {
    const relativePath = file.toString();

    const fullPath = path.join(
      folderPath,
      relativePath
    );

    if (
      fs.statSync(fullPath).isDirectory()
    ) {
      continue;
    }

    const fileBuffer =
      fs.readFileSync(fullPath);

    await s3.send(
      new PutObjectCommand({
        Bucket:
          process.env.AWS_BUCKET_NAME!,
        Key:
          `${s3Prefix}/${relativePath.replace(/\\/g, "/")}`,
        Body: fileBuffer,
      })
    );

    console.log(
      "Uploaded:",
      relativePath
    );
  }
}