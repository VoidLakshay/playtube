import { getChannel } from "./rabbitmq.js";
import { processVideo } from "../workers/videoWorker.js";

const QUEUE_NAME = "video-processing";

export const startConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(
    QUEUE_NAME,
    {
      durable: true,
    },
  );

  console.log(
    "🎧 Consumer Listening...",
  );

  channel.consume(
    QUEUE_NAME,
    async (message) => {

      if (!message) return;

      const data = JSON.parse(
        message.content.toString(),
      );

      console.log(
        "📦 JOB RECEIVED:",
        data,
      );

      await processVideo(
        data.videoId,
        data.videoPath,
      );

      channel.ack(message);

    },
    {
      noAck: false,
    },
  );
};