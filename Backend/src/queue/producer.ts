import { getChannel } from "./rabbitmq.js";

const QUEUE_NAME = "video-processing";

interface VideoJob {
  videoId: string;
  s3Key: string;
}

export const sendVideoJob = async (
  data: VideoJob,
) => {
  const channel = getChannel();

  await channel.assertQueue(
    QUEUE_NAME,
    {
      durable: true,
    },
  );

  channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(data)),
    {
      persistent: true,
    },
  );

  console.log("JOB SENT:", data);
};