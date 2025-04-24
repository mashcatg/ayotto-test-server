import { model, Schema } from "mongoose";

const logSchema = new Schema(
	{
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		action: {
			type: String,
			required: true,
		},
        
	},
	{
		timestamps: true,
	}
);

export const Log = model("Log", logSchema);
