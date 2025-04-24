import { model, Schema } from "mongoose";

const commentSchema = new Schema(
	{
		post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		author: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Comment = model("Comment", commentSchema);
