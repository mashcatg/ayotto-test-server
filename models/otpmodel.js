import mongoose, { model } from "mongoose";

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // Store hashed password
    otp: { type: String, required: true },
    expiresAt: { type: Date, default: () => Date.now() + 5 * 60 * 1000 } // Expires in 5 mins
});

 
export const OTP =model("OTP", otpSchema);
