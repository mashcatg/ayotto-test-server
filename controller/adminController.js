import { Log } from "../models/logModel.js";
import { User } from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";

// Create logs
const createLogs = async (req, res) => {
	try {
		const { userId } = req.params;
		const action = req.body.action;

		if (!action) {
			return res.status(400).json({
				success: false,
				message: "Action is required",
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const log = new Log({
			createdBy: user._id,
			action,
		});
		await log.save();
		res.status(200).json({
			success: true,
			message: "Log created successfully",
			data: null,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while creating log",
			error: error.message,
		});
	}
};

// Get all logs
const getAllLogs = async (req, res) => {
	try {
		const logs = await Log.find().populate("createdBy", "name role");
		res.status(200).json({
			success: true,
			message: "Logs fetched successfully",
			data: logs,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching logs",
			error: error.message,
		});
	}
};

// Create admin
const createAdmin = async (req, res) => {
	try {
		const { name, phone, password } = req.body;
		if (!name || !phone || !password) {
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
		if (password.length < 8) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 8 characters long",
			});
		}
		const isUserAlreadyExist = await User.findOne({ phone });
		if (isUserAlreadyExist) {
			return res.status(400).json({
				success: false,
				message: "Admin with this phone number already exists",
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const userData = {
			name,
			phone,
			password: hashedPassword,
			role: "admin",
		};

		// Save admin
		const newUser = new User(userData);
		await newUser.save();

		res.status(201).json({
			success: true,
			message: "Registration successful",
			data: {
				id: newUser._id,
				name: newUser.name,
				phone: newUser.phone,
				role: newUser.role,
			},
		});
	} catch (error) {
		//console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while creating admin",
			error: error.message,
		});
	}
};

// Make user as admin
const makeUserAsAdmin = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		user.role = "admin";
		await user.save();

		res.status(200).json({
			success: true,
			message: "User is now admin",
			data: {
				id: user._id,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while making user as admin",
			error: error.message,
		});
	}
};

// get all admin

const getAllAdmin = async (req, res) => {
	try {
		const admins = await User.find({ role: "admin" }).select("-password");
		res.status(200).json({
			success: true,
			message: "Admins fetched successfully",
			data: admins,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching admins",
			error,
		});
	}
};

// get admin by id

const getAdminById = async (req, res) => {
	try {
		const { adminId } = req.params;
		const admin = await User.findById(adminId).select("-password");
		if (!admin) {
			return res
				.status(404)
				.json({ success: false, message: "Admin not found" });
		}
		res
			.status(200)
			.json({ success: true, message: "Admin fetched", data: admin });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching admin",
			error,
		});
	}
};

export const adminController = {
	createLogs,
	getAllLogs,
	createAdmin,
	makeUserAsAdmin,
	getAllAdmin,
	getAdminById,
};
