import { model, Schema } from "mongoose";

const subjectSchema = new Schema(
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
		groupId: {
			type: Schema.Types.ObjectId,
			ref: "Group",
		},
		batchId: {
			type: Schema.Types.ObjectId,
			ref: "Batch",
            required: true,
		}
	},
	{
		timestamps: true,
	}
);

export const Subject = model("Subject", subjectSchema);
