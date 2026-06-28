import { getChannel } from "./rabbitmq.js";
import { processVideo } from "../workers/videoWorker.js";

const QUEUE_NAME = "video-processing";

interface VideoJob {
  videoId: string;
  s3Key: string;
}

export const startConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });

  console.log("🎧 Consumer Listening...");

  channel.consume(
    QUEUE_NAME,
    async (message) => {
      if (!message) return;

      try {
        const data: VideoJob = JSON.parse(
          message.content.toString(),
        );

        console.log("📥 JOB RECEIVED:", data);

        await processVideo(
          data.videoId,
          data.s3Key,
        );

        channel.ack(message);
      } catch (error) {
        console.error("Consumer Error:", error);

        channel.nack(
          message,
          false,
          false,
        );
      }
    },
    {
      noAck: false,
    },
  );
};