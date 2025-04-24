import { questionController } from "../controller/questionController.js";
import { Router } from "express";
import auth from "../middleware/auth.js";

const questionRouter = Router();

// Question Creation routes
questionRouter.post('/', auth("admin"),  questionController.createQuestions);

// Question Fetching & Searching Routes
questionRouter.get('/',  questionController.getAllQuestion);

// Update route
questionRouter.put('/:id', auth("admin"),  questionController.updateQuestion);

// Delete route
questionRouter.delete('/:id', auth("admin"),  questionController.deleteQuestion);

// Student route
questionRouter.post('/student/questions', auth("student"), questionController.getSPQuestions);

// Get questions
questionRouter.get('/', auth("admin"), questionController.countTotalQuestion);

export default questionRouter;