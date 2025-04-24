import { QuizSubmission } from "../models/quizSubmission.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";

const getLeaderboard = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = "", 
            timeFilter = "week",
            userId
        } = req.query;

        const now = new Date();
        let dateFilter = {};

        switch (timeFilter) {
            case "day":
                now.setHours(0, 0, 0, 0);
                dateFilter = { createdAt: { $gte: now } };
                break;
            case "week":
                now.setDate(now.getDate() - 7);
                dateFilter = { createdAt: { $gte: now } };
                break;
            case "month":
                now.setMonth(now.getMonth() - 1);
                dateFilter = { createdAt: { $gte: now } };
                break;
            case "all":
                dateFilter = {};
                break;
            default:
                now.setHours(0, 0, 0, 0);
                dateFilter = { createdAt: { $gte: now } };
        }

        // Get all users rankings first with proper sorting
        const allUsersRanking = await QuizSubmission.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$user",
                    totalStars: { $sum: "$stars" },
                    totalScore: { $sum: "$score" },
                    quizCount: { $sum: 1 },
                    totalIncorrect: { $sum: "$incorrectAnswers" },
                    lastSubmission: { $max: "$createdAt" }
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
                $project: {
                    _id: 1,
                    name: "$userDetails.name",
                    avatar: "$userDetails.avatar",
                    instituteName: "$userDetails.instituteName",
                    totalStars: 1,
                    totalScore: 1,
                    totalIncorrect: 1,
                    quizCount: 1,
                    lastSubmission: 1,
                    averageScore: {
                        $round: [{ $divide: ["$totalScore", "$quizCount"] }, 2]
                    }
                }
            },
            { 
                $sort: { 
                    totalStars: -1, 
                    totalScore: -1,   
                    quizCount: -1,   
                    totalIncorrect: 1,        
                    lastSubmission: -1         
                } 
            }
        ]);

        let currentRank = 1;
        let previousUser = null;
        const rankedUsers = allUsersRanking.map((user, index) => {
            if (previousUser) {
                if (user.totalStars !== previousUser.totalStars || 
                    user.totalScore !== previousUser.totalScore ||
                    user.quizCount !== previousUser.quizCount ||
                    user.totalIncorrect !== previousUser.totalIncorrect) {
                    currentRank = index + 1;
                }
            }
            previousUser = user;
            return {
                ...user,
                rank: currentRank
            };
        });

        // If userId is provided, return single user stats
        if (userId) {
            const userStats = rankedUsers.find(user => 
                user._id.toString() === userId.toString()
            );

            if (!userStats) {
                return res.status(200).json({
                    success: true,
                    data: {
                        user: {
                            _id: userId,
                            totalStars: 0,
                            totalScore: 0,
                            quizCount: 0,
                            rank: rankedUsers.length + 1
                        },
                        totalParticipants: rankedUsers.length
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    user: userStats,
                    totalParticipants: rankedUsers.length
                }
            });
        }

        // Apply search filter if provided
        let filteredUsers = rankedUsers;
        if (search) {
            filteredUsers = rankedUsers.filter(user => 
                user.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Get current user's position
        const currentUserId = req.user._id.toString();
        const myStats = rankedUsers.find(user => 
            user._id.toString() === currentUserId
        );
        const myPosition = myStats ? myStats.rank : rankedUsers.length + 1;

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedLeaderboard = filteredUsers.slice(startIndex, startIndex + parseInt(limit));

        res.status(200).json({
            success: true,
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredUsers.length / parseInt(limit)),
            total: filteredUsers.length,
            myPosition,
            myStats,
            timeFilter,
            search: search || undefined,
            leaderboard: paginatedLeaderboard
        });

    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching leaderboard",
            error: error.message
        });
    }
};

export const leaderboardController = {
    getLeaderboard
};