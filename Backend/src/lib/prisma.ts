import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected");
  } catch (error) {
    console.log("Database connection failed");

    console.log(error);

    process.exit(1);
  }
};

export default prisma;