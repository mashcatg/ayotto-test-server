import { Router } from "express";
import { commentController } from "../controller/commentController.js";
import auth from "../middleware/auth.js";

const commentRouter = Router();
// create comment
commentRouter.post(
	"/:postId/comment",
	auth("admin", "user"),
	commentController.createComment
);

// update Comment
commentRouter.put(
	"/comments/:commentId",
	auth("admin", "user"),
	commentController.updateComment
);

//delete comment
commentRouter.delete(
	"/comments/:commentId",
	auth("admin", "user"),
	commentController.deleteComment
);

export default commentRouter;
