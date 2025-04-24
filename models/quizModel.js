import { model, Schema } from "mongoose";

const quizSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		question: [
			{
				type: Schema.Types.ObjectId,
				ref: "Question",
				required: true,
			},
		],
		totalQuestions: { type: Number, required: true },
		challengedTo: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		topicIds: [
			{
				type: Schema.Types.ObjectId,
				ref: "Topic",
				required: true,
			},
		],
	},
	{
		timestamps: true,
	}
);

export const Quiz = model("Quiz", quizSchema);
