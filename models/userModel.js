import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		phone: { type: Number, required: true },
		password: { type: String, required: true },
		avatar: {
			type: String,
			default:
				"https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
		},
		batchId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Batch",
		},
		groupId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
		},
		instituteName: {
			type: String,
		},
		role: {
			type: String,
			required: true,
			enum: ["user", "admin"],
			default: "user",
		},

		isBanned: { type: Boolean, default: false },
		isDeleted: { type: Boolean, default: false },
		otp: { type: Number },
		verified: {
		type: Boolean,
		default: false
		},
		followers: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
			default: [],
		},
		followings: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

export const User = mongoose.model("User", userSchema);
