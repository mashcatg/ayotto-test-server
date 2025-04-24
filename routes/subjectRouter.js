import { Router } from "express";
import { subjectController } from "../controller/subjectController.js";
import auth from "../middleware/auth.js";

const subjectRouter = Router();

//create subject
subjectRouter.post("/", auth("admin"),   subjectController.createSubject);

// Get subjects
subjectRouter.get("/" , subjectController.getAllSubject);

// Update subject
subjectRouter.put("/:id", auth("admin"),   subjectController.updateSubject);

// Delete subject
subjectRouter.delete("/:id", auth("admin"),   subjectController.deleteSubject);

export default subjectRouter;
