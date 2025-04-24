import { QuizController } from "../controller/quizController.js";
import { Router } from "express";
import auth from "../middleware/auth.js";

const quizRouter = Router();

// Fetch User Quizzes
quizRouter.get(
	"/user/quizzes/:page/:limit",
	auth("user"),
	QuizController.getUserQuizzes
);

//create quiz
quizRouter.post("/", auth("user"), QuizController.quizCreation);

//submit quiz
quizRouter.post("/submit", auth("user"), QuizController.submitQuiz);

quizRouter.get("/my-challenges", auth("admin", "user"), QuizController.getMyChallengesQuiz);

// Get Quiz
quizRouter.get("/:quizId", auth("user"), QuizController.getQuizResults);

// Fetch questions details
quizRouter.post(
	"/questions/fetch",
	auth("user"),
	QuizController.fetchQuestions
);
quizRouter.get("/challenge/:challengeId", auth("user"), QuizController.fetchchallengeQuiz);
quizRouter.get("/getChallengersResults/:quizId", auth("user"), QuizController.getOtherUsersQuizResults);
quizRouter.post('/challenge-response', auth("user"), QuizController.handleChallengeResponse);

// Get student statistics
quizRouter.get('/student/stats', auth("user"), QuizController.getStudentStats);

export default quizRouter;
