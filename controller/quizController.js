import { Question } from "../models/questionModel.js";
import { Quiz } from "../models/quizModel.js";
import { QuizSubmission } from "../models/quizSubmission.js";
import { Topic } from "../models/topicModel.js";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";

const quizCreation = async (req, res) => {
	let { topicId, challengedTo, totalQuestions } = req.body;

	try {
		if (!Array.isArray(topicId) || topicId.length === 0) {
			return res
				.status(400)
				.json({ message: "Invalid topicId format or empty array" });
		}
		if (
			!totalQuestions ||
			typeof totalQuestions !== "number" ||
			totalQuestions <= 0
		) {
			return res
				.status(400)
				.json({ message: "Total questions must be a valid positive number" });
		}
		if (
			!Array.isArray(challengedTo) ||
			challengedTo.some((id) => !mongoose.Types.ObjectId.isValid(id))
		) {
			return res
				.status(400)
				.json({ message: "challengedTo must be an array of valid ObjectIds" });
		}

		// Convert topicId and challengedTo to ObjectId
		const topicIds = topicId.map((id) => new mongoose.Types.ObjectId(id));
		challengedTo = challengedTo.map((id) => new mongoose.Types.ObjectId(id));

		// Ensure positive numbers for question counts
		let boardCount = Math.max(Math.ceil(totalQuestions * 0.6), 0);
		let testCount = Math.max(Math.ceil(totalQuestions * 0.3), 0);
		let othersCount = Math.max(totalQuestions - (boardCount + testCount), 0);

		const getRandomQuestions = async (type, limit) => {
			if (limit <= 0) return []; // Skip aggregation if limit is 0 or negative
			return await Question.aggregate([
				{ $match: { topicId: { $in: topicIds }, type: type } },
				{ $sample: { size: limit } },
				{ $project: { _id: 1 } }, // Only fetch the _id field
			]);
		};

		let boardQuestions = await getRandomQuestions("board", boardCount);
		let testQuestions = await getRandomQuestions("test", testCount);
		let othersQuestions = await getRandomQuestions("others", othersCount);

		let allQuestions = [
			...boardQuestions,
			...testQuestions,
			...othersQuestions,
		];

		// If not enough questions, fill the gap from other types
		const fillRemainingQuestions = async () => {
			let remaining = totalQuestions - allQuestions.length;

			if (remaining > 0) {
				let extraQuestions = await Question.aggregate([
					{ $match: { topicId: { $in: topicIds } } },
					{ $sample: { size: remaining } },
					{ $project: { _id: 1 } }, // Only fetch the _id field
				]);
				allQuestions = [...allQuestions, ...extraQuestions];
			}
		};

		await fillRemainingQuestions();

		// Convert extracted question IDs to ObjectId
		const questionIds = allQuestions.map(
			(q) => new mongoose.Types.ObjectId(q._id)
		);

		// Save quiz
		const quiz = new Quiz({
			user: req.user._id, // Ensure user ID is ObjectId
			challengedTo: challengedTo,
			totalQuestions: questionIds.length,
			question: questionIds,
			topicIds: topicIds,
		});

		const savedQuiz = await quiz.save();

		// Fetch full question details
		const questions = await Question.find({
			_id: { $in: questionIds },
		})
			.populate("topicId", "name")
			.select({
				questionText: 1,
				questionOption: 1,
				questionRef: 1,
				solution: 1,
				type: 1,
				topicId: 1,
			})
			.lean();

		// Order questions same as questionIds
		const fetchQuizQuestions = questionIds.map((id) =>
			questions.find((q) => q._id.toString() === id.toString())
		);

		// Send response
		res.status(200).json({
			message: "Quiz created successfully",
			quizId: savedQuiz._id,
			totalQuestions: questionIds.length,
			questions: fetchQuizQuestions,
		});
	} catch (error) {
		//console.error("Error details:", error);
		res.status(500).json({
			message: "Error creating quiz",
			error: error.message,
			details: error.stack,
		});
	}
};

const submitQuiz = async (req, res) => {
	const { quizId, selectedAnswers } = req.body;
	const userId = req.user._id;

	try {
		if (!mongoose.Types.ObjectId.isValid(quizId)) {
			return res.status(400).json({ message: "Invalid quiz ID" });
		}
		if (!Array.isArray(selectedAnswers)) {
			return res
				.status(400)
				.json({ message: "Selected answers must be an array" });
		}

		// Get quiz with full question details
		const quiz = await Quiz.findById(quizId).populate({
			path: "question",
			select: "questionText questionOption",
		});

		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		if (selectedAnswers.length !== quiz.question.length) {
			return res.status(400).json({
				message: "Number of answers doesn't match number of questions",
			});
		}

		// Calculate scores
		let correctAnswers = 0;
		let incorrectAnswers = 0;

		quiz.question.forEach((question, index) => {
			const userAnswer = selectedAnswers[index];

			// Skip if question is not answered
			if (!userAnswer || userAnswer === "") {
				return;
			}

			// Find correct answer index
			const correctOption = question.questionOption.findIndex(
				(opt) => opt.isCorrect === true
			);

			// Convert letter (A,B,C,D) to index (0,1,2,3)
			const userAnswerIndex = userAnswer.charCodeAt(0) - 65; // 'A'=65 in ASCII

			if (userAnswerIndex === correctOption) {
				correctAnswers++;
			} else {
				incorrectAnswers++;
			}
		});

		const stars = correctAnswers - incorrectAnswers;

		// Create submission
		const submission = new QuizSubmission({
			user: userId,
			quiz: quizId,
			selectedOption: quiz.question.map((question, index) => ({
				questionId: question._id,
				selectedOption: selectedAnswers[index],
			})),
			score: correctAnswers,
			incorrectAnswers,
			stars: Math.max(0, stars),
		});
		

		await submission.save();

		res.status(200).json({
			message: "Quiz submitted successfully",
			results: {
				totalQuestions: quiz.question.length,
				correctAnswers,
				incorrectAnswers,
				unanswered: quiz.question.length - (correctAnswers + incorrectAnswers),
				stars: Math.max(0, stars),
			},
		});
	} catch (error) {
		//console.error("Error submitting quiz:", error);
		res.status(500).json({
			message: "Error submitting quiz",
			error: error.message,
		});
	}
};

const getQuizResults = async (req, res) => {
	try {
		const { quizId } = req.params;

		const results = await QuizSubmission.find({
			quiz: quizId,
		})
			.sort({ createdAt: -1 })
			.populate({
				path: "quiz",
				populate: {
					path: "question",
				},
			});

		if (!results) {
			return res.status(404).json({ message: "Quiz results not found" });
		}

		res.status(200).json(results);
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ message: "Error fetching quiz results", error: error.message });
	}
};

const fetchQuestions = async (req, res) => {
	try {
		const { quizId } = req.body;

		// Validate quizId
		if (!mongoose.Types.ObjectId.isValid(quizId)) {
			return res.status(400).json({
				message: "Invalid quiz ID format",
			});
		}

		// Find quiz and populate questions
		const quiz = await Quiz.findById(quizId).populate({
			path: "question",
			select: "questionText questionOption questionRef solution type topicId",
			populate: {
				path: "topicId",
				select: "name",
			},
		});

		if (!quiz) {
			return res.status(404).json({
				message: "Quiz not found",
			});
		}

		res.status(200).json({
			success: true,
			count: quiz.question.length,
			questions: quiz.question,
		});
	} catch (error) {
		//console.error("Error fetching questions:", error);
		res.status(500).json({
			message: "Error fetching questions",
			error: error.message,
		});
	}
};

const getUserQuizzes = async (req, res) => {
	try {
		const userId = new mongoose.Types.ObjectId(req.user._id);
		const { page = 1, limit = 3 } = req.params; // Changed to params and default limit to 3
		const skip = (parseInt(page) - 1) * parseInt(limit);

		//console.log('Fetching quizzes with limit:', limit, 'and skip:', skip);

		const submissions = await QuizSubmission.find({ user: userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate({
				path: "quiz",
				populate: {
					path: "topicIds",
					model: "Topic",
					populate: {
						path: "chapterId",
						populate: {
							path: "subjectId",
						},
					},
				},
			})
			.lean();

		// Get total count for pagination
		const totalCount = await QuizSubmission.countDocuments({ user: userId });

		//console.log('Found submissions:', submissions.length);

		if (!submissions || submissions.length === 0) {
			return res.status(200).json({
				success: true,
				totalQuizzes: 0,
				quizzes: [],
			});
		}

		const processedQuizzes = submissions
			.map((submission) => {
				const quiz = submission.quiz;
				if (!quiz || !quiz.topicIds || !Array.isArray(quiz.topicIds)) {
					//console.log('Invalid quiz data:', quiz?._id);
					return null;
				}

				const topicData = quiz.topicIds
					.filter((topic) => topic && topic.name) // Ensure topic exists and has name
					.map((topic) => ({
						topic: topic.name,
						chapter: topic.chapterId?.name,
						subject: topic.chapterId?.subjectId?.name,
					}));

				return {
					quizId: quiz._id,
					totalQuestions: quiz.totalQuestions || 0,
					stars: submission.stars || 0,
					correctAnswers: submission.score || 0,
					incorrectAnswers: submission.incorrectAnswers || 0,
					createdAt: submission.createdAt,
					subjects: [
						...new Set(topicData.map((t) => t.subject).filter(Boolean)),
					],
					chapters: [
						...new Set(topicData.map((t) => t.chapter).filter(Boolean)),
					],
					topics: [...new Set(topicData.map((t) => t.topic).filter(Boolean))],
				};
			})
			.filter(Boolean);

		//console.log('Processed quizzes:', processedQuizzes.length);

		res.status(200).json({
			success: true,
			currentPage: parseInt(page),
			totalPages: Math.ceil(totalCount / parseInt(limit)),
			totalQuizzes: totalCount,
			quizzes: processedQuizzes,
		});
	} catch (error) {
		//console.error("Error in getUserQuizzes:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching quizzes",
			error: error.message,
			stack: error.stack,
		});
	}
};

const getMyChallengesQuiz = async (req, res) => {
	try {

		console.log(req.user._id)

		const quizzes = await Quiz.find({
			challengedTo: req.user._id,
		}).populate("user").populate("question").populate("topicIds").populate("challengedTo")

		res
			.status(201)
			.json({ success: true, message: "quiz retrieved Successful", quizzes });
	} catch (err) {
		console.log(err)
		res.status(500).json({
			success: false,
			message: "Failed to fetched my challenges quiz",
			error: err,
		});
	}
};

 
const fetchchallengeQuiz = async (req, res) => {
	try {
	  const { challengeId } = req.params;
	  
	  // Find the challenge quiz with correct population
	  const quiz = await Quiz.findById(challengeId)
		.populate({
		  path: 'question', // Changed from 'questions' to 'question'
		  select: 'questionText questionOption questionRef solution type topicId',
		  populate: {
			path: 'topicId',
			select: 'name'
		  }
		});
	  
	  if (!quiz) {
		return res.status(404).json({ 
		  success: false,
		  message: 'Challenge not found' 
		});
	  }
	  
	  return res.status(200).json({
		success: true,
		quizId: quiz._id,
		questions: quiz.question, // Changed from quiz.questions to quiz.question
		totalQuestions: quiz.totalQuestions
	  });
	  
	} catch (error) {
	  console.error('Error fetching challenge quiz:', error);
	  return res.status(500).json({ 
		success: false,
		message: 'Error fetching challenge quiz',
		error: error.message 
	  });
	}
  };
const getOtherUsersQuizResults = async (req, res) => {
	try {
	  const { quizId } = req.params;
	  const currentUserId = req?.user?._id;
	  console.log(currentUserId,"currentUserId")
  
	  // Validate quiz ID
	  if (!mongoose.Types.ObjectId.isValid(quizId)) {
		return res.status(400).json({
		  success: false,
		  message: "Invalid quiz ID format"
		});
	  }
  
	  // Find the quiz to verify it exists
	  const quiz = await Quiz.findById(quizId);
	  
	  if (!quiz) {
		return res.status(404).json({
		  success: false,
		  message: "Quiz not found"
		});
	  }
  
	  // Fetch all other users' submissions for this quiz, excluding the current user
	  const otherUsersSubmissions = await QuizSubmission.find({
		quiz: quizId,
		user: { $ne: currentUserId } // Exclude current user
	  })
		.populate({
		  path: "user",
		  select: "name phone avater" // Adjust fields as needed
		})
		.select("user score incorrectAnswers stars createdAt")
		.sort({ stars: -1, score: -1 }) // Sort by stars (desc), then by score (desc)
		.lean();
		console.log(otherUsersSubmissions,"otherUsersSubmissions")
  
	  // Format the response
	  const formattedResponse = {
		success: true,
		quizId,
		totalSubmissions: otherUsersSubmissions.length,
		submissions: otherUsersSubmissions
	  };
  
	  res.status(200).json(formattedResponse);
	} catch (error) {
	  console.error("Error fetching other users' quiz results:", error);
	  res.status(500).json({
		success: false,
		message: "Error fetching other users' quiz results",
		error: error.message
	  });
	}
  };
  const handleChallengeResponse = async (req, res) => {
	try {
	  const { quizId, action } = req.body;
	  console.log(quizId, action ,"quizId, action")
	  const userId = req?.user?._id;
  
	  // Validate inputs
	  if (!mongoose.Types.ObjectId.isValid(quizId)) {
		return res.status(400).json({
		  success: false,
		  message: "Invalid quiz ID format"
		});
	  }
  
	  if (!['accept', 'decline'].includes(action)) {
		return res.status(400).json({
		  success: false,
		  message: "Action must be either 'accept' or 'decline'"
		});
	  }
  
	  // Find the quiz
	  const quiz = await Quiz.findById(quizId);
	  
	  if (!quiz) {
		return res.status(404).json({
		  success: false,
		  message: "Quiz not found"
		});
	  }
  
	  // Check if user is actually in the challengedTo array
	  const isUserChallenged = quiz.challengedTo.some(id => 
		id.toString() === userId.toString()
	  );
  
	  if (!isUserChallenged) {
		return res.status(400).json({
		  success: false,
		  message: "User is not challenged in this quiz"
		});
	  }
  
	  // Remove user from challengedTo array
	  await Quiz.findByIdAndUpdate(
		quizId,
		{ $pull: { challengedTo: userId } },
		{ new: true }
	  );
  
	  // If action is 'accept', we could potentially create a QuizSubmission document or 
	  // take other action here. For this implementation, we're just removing from challengedTo.
	  
	  // Return appropriate response based on action
	  if (action === 'accept') {
		return res.status(200).json({
		  success: true,
		  message: "Challenge accepted. You can now take the quiz.",
		  action: "accept"
		});
	  } else {
		return res.status(200).json({
		  success: true,
		  message: "Challenge declined successfully.",
		  action: "decline"
		});
	  }
  
	} catch (error) {
	  console.error("Error handling challenge response:", error);
	  return res.status(500).json({
		success: false,
		message: "Error handling challenge response",
		error: error.message
	  });
	}
  };



 

export const getStudentStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get total quizzes taken
        const totalQuizzes = await Quiz.countDocuments({ userId });

        // Get total stars earned
        const userQuizzes = await Quiz.find({ userId });
        const totalStars = userQuizzes.reduce((acc, quiz) => acc + (quiz.stars || 0), 0);

        // Calculate position based on total stars (assuming position is rank among all users)
        const allUsers = await User.aggregate([
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    totalStars: {
                        $sum: '$quizzes.stars'
                    }
                }
            },
            {
                $sort: { totalStars: -1 }
            }
        ]);

        const position = allUsers.findIndex(user => user._id.toString() === userId) + 1;

        const stats = {
            position,
            totalQuizzes,
            totalStars,
            recentQuizzes: userQuizzes.slice(-5), // Get last 5 quizzes
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching student statistics",
            error: error.message
        });
    }
};
  
  // Update the QuizController export to include the new function
  export const QuizController = {
	quizCreation,
	submitQuiz,
	getQuizResults,
	fetchQuestions,
	getUserQuizzes,
	getMyChallengesQuiz,
	fetchchallengeQuiz,
	getOtherUsersQuizResults,
	handleChallengeResponse,
	getStudentStats
  };