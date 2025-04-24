import { model, Schema } from "mongoose";

const batchSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
        session: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "inactive"],
            default: "active",
        },
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Batch = model("Batch", batchSchema);

