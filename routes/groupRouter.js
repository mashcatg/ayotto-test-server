import { Router } from "express";
import { groupController } from "../controller/groupController.js";
import auth from "../middleware/auth.js";

const groupRouter = Router();

//create group
groupRouter.post("/", auth("admin"),     groupController.createGroup);

// Get groups
groupRouter.get("/", groupController.getAllGroup);

// Update group
groupRouter.put("/:id", auth("admin"),     groupController.updateGroup);

// Delete group
groupRouter.delete("/:id", auth("admin"),     groupController.deleteGroup);

export default groupRouter;
