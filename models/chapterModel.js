import { model, Schema } from "mongoose";

const chapterSchema = new Schema(
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
		subjectId: {
			type: Schema.Types.ObjectId,
			ref: "Subject",
			required: true,
		},
        
	},
	{
		timestamps: true,
	}
);

export const Chapter = model("Chapter", chapterSchema);
 