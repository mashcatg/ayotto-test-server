import { model, Schema } from "mongoose";

const questionSchema = new Schema(
	{
		questionText: {
			type: String,
			required: true,
		},
		questionOption: [
			{
				text: {
					type: String,
					required: true,
				},
				isCorrect: {
					type: Boolean,
					required: true,
				},
			},
		],
		questionRef: {
			type: String,
		},
		solution: {
			type: String,
		},
        topicId: [
			{
				type: Schema.Types.ObjectId,
                ref: "Topic",
				required: true,
			},
		],
		type: {
			type: String,
			enum: ["board", "test", "others"],
			default: "others",
			required: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
		}
	},
	{
		timestamps: true,
	}
);

export const Question = model("Question", questionSchema);
