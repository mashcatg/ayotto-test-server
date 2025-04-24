import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { sendSMS } from "../service/sendSms.js";
import { User } from "../models/userModel.js";
import { OTP } from "../models/otpmodel.js";
import { TempUser } from "../models/TempUser.js";
 


 

const registerUser = async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const isUserAlreadyExist = await User.findOne({ phone });
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: "User with this phone number already exists" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const message = `Dear ${name}, Your verification OTP is: ${otp} - Ayotto`;

        const response = await sendSMS(phone, message);
        if (!response) {
            return res.status(400).json({ success: false, message: "Failed to send SMS" });
        }

        // Store OTP in the OTP collection (which has built-in expiration)
        await OTP.findOneAndUpdate(
            { phone },
            { 
                phone, 
                otp: otp.toString(), // Ensure OTP is stored as string to match schema
                createdAt: new Date() // Reset the TTL expiration
            },
            { upsert: true, new: true }
        );

        // Store registration data in a temporary session/storage
        // You can use a session store or temporary collection
        await TempUser.findOneAndUpdate(
            { phone },
            { name, phone, password },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please verify to complete registration.",
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while registering user",
            error: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        const otpData = await OTP.findOne({ phone });
        
        if (!otpData) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }
        
        if (otpData.otp !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Get user data from temporary storage
        const tempUserData = await TempUser.findOne({ phone });
        if (!tempUserData) {
            return res.status(400).json({ message: "Registration session expired. Please register again." });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempUserData.password, salt);

        // Create User
        const newUser = new User({
            name: tempUserData.name,
            phone: tempUserData.phone,
            password: hashedPassword,
            isVerified: true,
            createdAt: new Date()
        });
        
        await newUser.save();

        // Remove OTP and temporary user data
        await OTP.deleteOne({ phone });
        await TempUser.deleteOne({ phone });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while verifying OTP",
            error: error.message
        });
    }
};

// Add a resend OTP functionality
const resendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        // Check if user already exists
        const isUserAlreadyExist = await User.findOne({ phone });
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: "User with this phone number already exists" });
        }

        // Check if there's an existing registration in progress
        const tempUserData = await TempUser.findOne({ phone });
        if (!tempUserData) {
            return res.status(400).json({ message: "No registration in progress for this phone number" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const message = `Dear ${tempUserData.name}, Your new verification OTP is: ${otp} - Ayotto`;

        const response = await sendSMS(phone, message);
        if (!response) {
            return res.status(400).json({ success: false, message: "Failed to send SMS" });
        }

        // Update OTP (the TTL will reset automatically with the new createdAt date)
        await OTP.findOneAndUpdate(
            { phone },
            { 
                otp: otp.toString(),
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "New OTP sent successfully.",
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while resending OTP",
            error: error.message
        });
    }
};

 


const loginUser = async (req, res) => {
	try {
		const { phone, password } = req.body;

		if (!phone || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide all required fields",
			});
		}

		if (!validator.isMobilePhone(phone.toString())) {
			return res.status(400).json({
				success: false,
				message: "Please enter a valid phone number",
			});
		}
		const userExist = await User.findOne({ phone });
		if (!userExist) {
			return res.status(400).json({
				success: false,
				message: "User doesn't exist",
			});
		}

		const isPasswordValid = await bcrypt.compare(password, userExist.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Incorrect password",
			});
		}

		const token = jwt.sign(
			{ id: userExist._id, role: userExist.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		res
			.status(201)
			.cookie("token", token, {
				httpOnly: true,
				secure: true,
			})
			.json({
				success: true,
				message: "Login successful",
				token,
				data: userExist,
			});
	} catch (error) {
		//console.log(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error,
		});
	}
};


const logoutUser = async (req, res) => {
	try {
		res.clearCookie("token", { httpOnly: true });
		res.status(200).json({
			success: true,
			data: {},
			message: "Logout successful",
		});
	} catch (error) {
		//console.log(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error,
		});
	}
};

const forgetPassword = async (req, res) => {
	try {
		const { phone } = req.body;
		if (!phone) {
			return res.status(400).json({
				success: false,
				message: "Please provide your phone number",
			});
		}
		if (!validator.isMobilePhone(phone.toString())) {
			return res.status(400).json({
				success: false,
				message: "Please enter a valid phone number",
			});
		}
		const userExist = await User.findOne({ phone });
		if (!userExist) {
			return res.status(400).json({
				success: false,
				message: "User doesn't exist",
			});
		}
		const otp = Math.floor(100000 + Math.random() * 900000);
		userExist.otp = otp;
		await userExist.save();

		const message = `Dear ${userExist.name}, Your OTP for password reset is: ${otp} - Ayotto`;
		await sendSMS(phone, message);
		res.status(200).json({
			success: true,
			message: "OTP sent successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error,
		});
	}
};

const resetPassword = async (req, res) => {
	try {
		const { phone, otp, newPassword } = req.body;

		if (!phone || !otp || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Please provide all required fields",
			});
		}

		if (!validator.isMobilePhone(phone.toString())) {
			return res.status(400).json({
				success: false,
				message: "Please enter a valid phone number",
			});
		}
		const userExist = await User.findOne({ phone });
		if (!userExist) {
			return res.status(400).json({
				success: false,
				message: "User doesn't exist",
			});
		}
		if (userExist.otp === undefined) {
			return res.status(400).json({
				success: false,
				message: "OTP not found",
			});
		}

		if (userExist.otp !== parseInt(otp)) {
			return res.status(400).json({
				success: false,
				message: "Invalid OTP",
			});
		}

		const isPasswordValid = await bcrypt.compare(
			newPassword,
			userExist.password
		);
		if (isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "New password should not be the same as current password",
			});
		}

		if (newPassword.length < 8) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 8 characters long",
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		userExist.password = hashedPassword;
		userExist.otp = undefined;
		await userExist.save();

		const token = jwt.sign(
			{ id: userExist._id, role: userExist.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		res.status(200).json({
			success: true,
			message: "Password reset successful",
			token,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error,
		});
	}
};


 

const verifyUser = async (req, res) => {
	const { phone, otp } = req.body;
	//console.log(req.body);
	try {
		const user = await User.findOne({ phone });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "user not found",
			});
		}

		if (user.otp !== otp) {
			return res.status(403).json({
				success: false,
				message: "Invalid otp",
			});
		}
		user.verified = true;
		user.otp = "";
		await user.save();
		res.status(200).json({
			success: true,
			message: "successfully verified user",
		});
	} catch (error) {
		//console.log(error);
		res.status(500).json({
			success: false,
			message: "failed to verified user",
			error,
		});
	}
};

export const authController = {
	registerUser,
	loginUser,
	forgetPassword,
	resetPassword,
	logoutUser,
	verifyUser,
	verifyOTP
};
