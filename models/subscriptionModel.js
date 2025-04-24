import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		trnxId: {
			type: Schema.Types.ObjectId,
			ref: "Transaction",
			required: true,
		},
        planAmount:{
            type: Number,
            required: true
        },
        startDate:{
            type: Date,
            required: true
        },
        endDate:{
            type: Date,
            required: true
        },
        
	},
	{
		timestamps: true,
	}
);

export const Subscription = model("Subscription", subscriptionSchema);
