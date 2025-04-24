import { chapterController } from "../controller/chapterController.js";
import { Router } from "express";
import auth from "../middleware/auth.js";


const chapterRouter = Router();

//create chapter
chapterRouter.post('/', auth("admin"),  chapterController.createChapter);

// Get chapters
chapterRouter.get('/',  chapterController.getAllChapter);

// Update chapter
chapterRouter.put('/:id', auth("admin"),  chapterController.updateChapter);

// Delete chapter
chapterRouter.delete('/:id', auth("admin"),  chapterController.deleteChapter);

export default chapterRouter;