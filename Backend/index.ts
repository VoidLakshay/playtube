import express, { type Request, type Response } from "express";

import "dotenv/config";

import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

import passport from "./src/config/passport.js";

import authRouter from "./src/routes/auth.route.js";

import prisma from "./src/lib/prisma.js";
import channelRouter from "./src/routes/channel.route.js";
import videoRouter from "./src/routes/video.route.js";
import commentRouter from "./src/routes/comment.route.js";
import subscriptionRouter from "./src/routes/subscription.route.js";
import playlistRouter from "./src/routes/playlist.route.js";
import historyRouter from "./src/routes/history.route.js";
import feedRouter from "./src/routes/feed.route.js";
import watchLaterRouter from "./src/routes/watchlater.route.js";
import studioRouter from "./src/routes/studio.route.js";
import postRouter from "./src/routes/post.route.js";
import verifyRouter from "./src/routes/verify.route.js";
import { connectRabbitMQ } from "./src/queue/rabbitmq.js";
import { startConsumer } from "./src/queue/consumer.js";
const app = express();

const PORT = process.env.PORT || 3000;

// ---------------- MIDDLEWARES ----------------

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ---------------- SESSION ----------------

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",

    resave: false,

    saveUninitialized: false,
  }),
);

// ---------------- PASSPORT ----------------

app.use(passport.initialize());

app.use(passport.session());

// ---------------- ROUTES ----------------

app.use("/api/auth", authRouter);

app.use("/api/channel", channelRouter);

app.use("/api/video", videoRouter);
app.use("/api/comment", commentRouter);
app.use("/api/subscription", subscriptionRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api/history", historyRouter);
app.use("/api/feed", feedRouter);
app.use("/api/watch-later", watchLaterRouter);
app.use("/api/studio", studioRouter);
app.use("/api/posts", postRouter);
app.use("/api/verify", verifyRouter);

// ---------------- HEALTH CHECK ----------------

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// ---------------- SERVER START ----------------

const startServer = async () => {
  try {
    await prisma.$connect();

    await connectRabbitMQ();
    await startConsumer();


    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server startup failed:", error);

    process.exit(1);
  }
};

startServer();
