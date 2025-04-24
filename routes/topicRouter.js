import { topicController } from "../controller/topicController.js";
import { Router } from "express";
import auth from "../middleware/auth.js";


const topicRouter = Router();

//create subject
topicRouter.post('/', auth("admin"),    topicController.createTopic);

// Get subjects
topicRouter.get('/', topicController.getAllTopics);

// Update subject
topicRouter.put('/:id', auth("admin"),    topicController.updateTopic);

// Delete subject
topicRouter.delete('/:id', auth("admin"),    topicController.deleteTopic);

export default topicRouter;