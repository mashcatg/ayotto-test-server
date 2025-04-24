import { model, Schema } from "mongoose";

const paymentGateWaySchema = new Schema(
	{
		gateWay: {
			type: String,
			required: true,
		},
		transactionId: {
			type: String,
			required: true,
		},
		transactionTo: {
			type: String,
			required: true,
		},
		transactionFrom: {
			type: String,
			required: true,
		},
	},
	{
        _id: 0
    }
);

const transactionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},

		couponDiscount: {
			type: Number,
			required: true,
		},

		paidAmount: {
			type: Number,
			required: true,
		},
		trnxType: {
			type: String,
			enum: ["mobile", "card", "bank"],
		},
		paymentGateWayDetails: paymentGateWaySchema,
	},
	{
		timestamps: true,
	}
);

export const Transaction = model("Transaction", transactionSchema);
