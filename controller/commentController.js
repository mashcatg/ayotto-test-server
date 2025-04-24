import { Comment } from "../models/commentMode.js";
import { Post } from "../models/postModel.js";

const createComment = async (req, res) => {
	try {
		const postId = req.params.postId;
		console.log(postId, 'comment');
		const comment = new Comment({
			post: postId,
			author: req.user._id,
			content: req.body.content,
		});

		

		await comment.save();
		await Post.findByIdAndUpdate(postId, {
			$push: { comments: comment._id },
		});
		res.status(201).json({ success: true, message: "Comment added" });
	} catch (err) {
		console.log(err)
		res
			.status(500)
			.json({ success: false, message: "Failed to comment on post", error: err });
			
	}
};

const updateComment = async (req, res) => {
	try {
		const commentId = req.params.commentId;
		const comment = await Comment.findByIdAndUpdate(commentId, req.body, {
			new: true,
		});
		res.json(comment);
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: "Failed to update comment", error: err });
	}
};

const deleteComment = async (req, res) => {
	try {
		const commentId = req.params.commentId;

		await Comment.findByIdAndDelete(commentId);
		res.json({ success: true, message: "Comment deleted" });
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: "Failed to delete comment", error: err });
	}
};

export const commentController = {
	createComment,
	updateComment,
	deleteComment,
};
