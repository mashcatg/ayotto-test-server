import { model, Schema } from "mongoose";

const groupSchema = new Schema(
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
		batchId: {
			type: Schema.Types.ObjectId,
			ref: "Batch",
			required: true,
		},
        
	},
	{
		timestamps: true,
	}
);

export const Group = model("Group", groupSchema);