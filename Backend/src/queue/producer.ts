import { getChannel } from "./rabbitmq.js";

const QUEUE_NAME = "video-processing";

export const sendVideoJob = async (
  data: any,
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
    Buffer.from(
      JSON.stringify(data),
    ),
  );

  console.log(
    "JOB SENT TO QUEUE",
  );
};