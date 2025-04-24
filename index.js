import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRouter.js";
import batchRouter from "./routes/batchRouter.js";
import groupRouter from "./routes/groupRouter.js";
import subjectRouter from "./routes/subjectRouter.js";
import chapterRouter from "./routes/chapterRouter.js";
import topicRouter from "./routes/topicRouter.js";
import questionRouter from "./routes/questionRouter.js";
import quizRouter from "./routes/quizRouter.js";
import globalErrorHandler from "./middleware/golobalErrorHandler.js";
import notFoundRoute from "./middleware/notFoundRoute.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import cookieParser from "cookie-parser";

import postRouter from "./routes/postRouter.js";
import commentRouter from "./routes/commentRouter.js";

import leaderboardRouter from "./routes/leaderboardRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;

app.use(
	cors({
		origin: [
		  "http://localhost:5173",
		  "https://ayotto-beta-test.netlify.app",
		  "http://ayotto-beta-test.netlify.app"
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	  })
);
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/batch", batchRouter);
app.use("/api/group", groupRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/chapter", chapterRouter);
app.use("/api/topic", topicRouter);
app.use("/api/question", questionRouter);
app.use("/api/quiz", quizRouter);

app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

app.use("/api/leaderboard", leaderboardRouter);

app.get("/", async (req, res) => {
	res.send("I changing the base content  : " + port);
});

app.use(notFoundRoute);
app.use(globalErrorHandler);

app.listen(port, () => console.log("My server is running on port:", port));
