import { postController } from "../controller/postController.js";
import { Router } from "express";
import auth from "../middleware/auth.js";

const postRouter = Router();

// Auth required for all post operations
postRouter.use(auth("admin", "user"));

// Post CRUD routes
postRouter.post("/", postController.createPost);
postRouter.get("/", postController.getPosts);
postRouter.put("/:id", postController.updatePost);
postRouter.delete("/:id", postController.deletePost);

// Upvote route
postRouter.post("/:id/toggle-upvote", postController.toggleUpvote);

// Comment routes
postRouter.post("/:id/comments", postController.addComment);
postRouter.put("/:postId/comments/:commentId", postController.updateComment);
postRouter.delete("/:postId/comments/:commentId", postController.deleteComment);

export default postRouter;
