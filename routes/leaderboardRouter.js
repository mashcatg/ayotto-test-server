import { Router } from "express";
import { leaderboardController } from "../controller/leaderboardController.js";
import auth from "../middleware/auth.js";

const leaderboardRouter = Router();

leaderboardRouter.get('/', auth("user"), leaderboardController.getLeaderboard);

export default leaderboardRouter;
