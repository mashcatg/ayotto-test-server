import { User } from "../models/userModel.js";
import { QuizSubmission } from "../models/quizSubmission.js";
import { Quiz } from "../models/quizModel.js";
import mongoose from "mongoose";
import { Question } from "../models/questionModel.js";

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		if (!users) {
			return res.status(404).json({ success: false, message: "user not found", data: null });
		}
		res.status(200).json({
			success: true,
			message: "Users fetched successfully",
			data: users,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching users",
			error,
		});
	}
};

const getUserByPhone = async (req, res) => {
	try {
		const { phone } = req.params;
		const user = await User.findOne({ phone });
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found", data: null });
		}
		res
			.status(200)
			.json({ success: true, message: "User fetched", data: user });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching user",
			error,
		});
	}
};


const isUserAlreadyExist = async (req, res) => {
	try {
		const { phone } = req.params;
		const user = await User.findOne({ phone });
		if (user) {
			return res
				.status(200)
				.json({ success: true, message: "User already exist", data: true });
		}
		res
			.status(200)
			.json({ success: true, message: "User does not exist", data: false });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching user",
			error,
		});
	}
};

const bannedUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(500)
				.json({ success: false, message: "user not found", data: null });
		}
		user.isBanned = true;
		await user.save();
		res.status(200).json({ message: "User banned successfully", data: null });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Something went wrong while banning user", error });
	}
};

const updateUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const { groupId, batchId } = req.body;
		const user = await User.findById(userId);
		user.groupId = groupId;
		user.batchId = batchId;
		await user.save();
		const newUser = await User.findById(userId);
		res.status(200).json({ message: "User is successfully updated", data: newUser });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Something went wrong while updating user", error });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(500)
				.json({ success: false, message: "user not found", data: null });
		}
		user.isDeleted = true;
		await user.save();
		res
			.status(200)
			.json({
			success: true,
			message: "User deleted successfully",
			data: null,
		});
	} catch (error) {
		res
			.status(500)
			.json({
			success: false,
			message: "Something went wrong while deleting user",
			error,
		});
	}
};

const getUserByBatchAndGroup = async (req, res) => {
	try {
		const { groupId, batchId } = req.body;
		const user = await User.find({
			$or:[
				{groupId},
				{batchId}
			]
		}).select("-password");
		if (!user) {
			return res
				.status(500)
				.json({ success: false, message: "user not found", data: null });
		}
		res
			.status(200)
			.json({
			success: true,
			message: "User retrieved successfully",
			data: user,
		});
	} catch (error) {
		res
			.status(500)
			.json({
			success: false,
			message: "Something went wrong while fetching user",
			error,
		});
	}
};

const getProfileDetails = async (req, res) => {
	try {
		const requestedUserId = req.params.userId;
		const currentUserId = req.user._id;

		const user = await User.findById(requestedUserId)
			.populate('batchId', 'name')
			.populate('groupId', 'name')
			.select('-password -isDeleted -isBanned -role -createdAt -updatedAt');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

		const userProfile = {
			name: user.name,
			avatar: user.avatar,
			batch: user.batchId?.name || null,
			group: user.groupId?.name || null,
			phone: currentUserId.toString() === requestedUserId ? user.phone : undefined,
			followingCount: user.followers?.length || 0,
			followerCount: user.followings?.length || 0
		};

		res.status(200).json({
			success: true,
			data: userProfile
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching profile details",
			error: error.message
		});
	}
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Get user's quiz submissions and challenges first
        const [quizSubmissions, challengeQuizzes] = await Promise.all([
            QuizSubmission.find({ user: userId }),
            Quiz.find({ challengedTo: userId })
        ]);

        // Calculate total stats from submissions
        const detailedStats = quizSubmissions.reduce((stats, submission) => {
            stats.totalStars += submission.stars || 0;
            stats.totalScore += submission.score || 0;
            stats.totalIncorrect += submission.incorrectAnswers || 0;
            return stats;
        }, {
            totalStars: 0,
            totalScore: 0,
            totalIncorrect: 0
        });

        // Get all users rankings
        const allUsersRanking = await QuizSubmission.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalStars: { $sum: "$stars" },
                    totalScore: { $sum: "$score" },
                    quizCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $sort: {
                    totalStars: -1,
                    totalScore: -1,
                    quizCount: -1
                }
            }
        ]);

        // Find user's position (index + 1)
        const userPosition = allUsersRanking.findIndex(user => 
            user._id.toString() === userId.toString()
        ) + 1;

        res.status(200).json({
            success: true,
            data: {
                totalQuizzes: quizSubmissions.length,
                totalChallenges: challengeQuizzes.length,
                ...detailedStats,
                currentPosition: userPosition || allUsersRanking.length + 1,
                averageScore: quizSubmissions.length > 0 ? 
                    Math.round((detailedStats.totalScore / quizSubmissions.length) * 10) / 10 : 0
            }
        });

    } catch (error) {
        console.error('User Stats Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user statistics",
            error: error.message
        });
    }
};

const getWeeklyProgress = async (req, res) => {
    try {
        const userId = req.params.userId;
        const endDate = new Date(); // Today's date
        endDate.setHours(23, 59, 59, 999); // Set to end of day

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
        startDate.setHours(0, 0, 0, 0); // Set to start of day

        // Check if user has any submissions
        const hasSubmissions = await QuizSubmission.exists({
            user: new mongoose.Types.ObjectId(userId)
        });

        if (!hasSubmissions) {
            return res.status(200).json({
                success: true,
                message: "No quiz data available",
                data: []
            });
        }

        const weeklyProgress = await QuizSubmission.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    createdAt: { 
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalScore: { $sum: "$score" },
                    totalMaxScore: { $sum: { $size: "$selectedOption" }}
                }
            },
            {
                $project: {
                    date: "$_id",
                    percentage: {
                        $cond: [
                            { $eq: ["$totalMaxScore", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$totalScore", "$totalMaxScore"] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Fill in missing dates with 0%
        const filledProgress = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const existingProgress = weeklyProgress.find(p => p.date === dateStr);
            filledProgress.push({
                date: dateStr,
                percentage: existingProgress ? 
                    Math.round(existingProgress.percentage * 10) / 10 : 0
            });
        }

        res.status(200).json({
            success: true,
            data: filledProgress
        });
    } catch (error) {
        console.error('Weekly Progress Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching weekly progress",
            error: error.message
        });
    }
};

const editProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { avatar, instituteName } = req.body;

        // Validate inputs
        const updates = {};
        if (avatar) {
            if (typeof avatar !== 'string' || !avatar.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Avatar must be a valid URL string"
                });
            }
            updates.avatar = avatar.trim();
        }
        
        if (instituteName) {
            if (typeof instituteName !== 'string' || !instituteName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Institute name must be a valid string"
                });
            }
            updates.instituteName = instituteName.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, select: 'name avatar instituteName' }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error('Edit Profile Error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const adminId = req.params.userId;

        // Verify if the requested user is an admin
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized as admin"
            });
        }

        // Get both admin's questions and total questions in parallel
        const [adminQuestions, totalQuestions, recentQuestions] = await Promise.all([
            Question.countDocuments({ createdBy: adminId }),
            Question.countDocuments({}),  // Total questions across all admins
            Question.find({ createdBy: adminId })
                .select('questionText createdAt')
                .sort({ createdAt: -1 })
                .limit(3)
        ]);

        res.status(200).json({
            success: true,
            data: {
                questionsAdded: adminQuestions,
                totalQuestions,
                recentQuestions: recentQuestions.map(q => ({
                    id: q._id,
                    title: q.questionText,
                    date: q.createdAt
                })),
                contribution: totalQuestions > 0 
                    ? Math.round((adminQuestions / totalQuestions) * 100)
                    : 0
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin statistics",
            error: error.message
        });
    }
};

export const userController = {
	getAllUsers,
	bannedUser,
	deleteUser,
	getUserByPhone,
	isUserAlreadyExist,
	updateUser,
	getUserByBatchAndGroup,
	getProfileDetails,
	getUserStats,
	getWeeklyProgress,
	editProfile,
    getAdminStats
};