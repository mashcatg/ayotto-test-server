import { model, Schema } from "mongoose";

const referralSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		referredBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
        
	},
	{
		timestamps: true,
	}
);

export const Referral = model("Referral", referralSchema);
