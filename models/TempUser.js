import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Expires in 10 minutes
});

export const TempUser = mongoose.model("TempUser", tempUserSchema);