import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(
      process.env.RABBIT_URL!,
    );

    channel = await connection.createChannel();

    console.log("🐰 RabbitMQ Connected");

    return channel;
  } catch (error) {
    console.error(
      "RabbitMQ Connection Error:",
      error,
    );
  }
};

export const getChannel = () => {
  return channel;
};