import { model, Schema } from "mongoose";

const topicSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		chapterId: {
			type: Schema.Types.ObjectId,
			ref: "Chapter",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Topic = model("Topic", topicSchema);

 