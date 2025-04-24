import { Question } from "../models/questionModel.js";
import { Topic } from "../models/topicModel.js";
import mongoose from "mongoose";
const createQuestions = async (req, res) => {
	let { questions, topicId, type } = req.body;
	try {
		if (
			!Array.isArray(questions) ||
			questions.length === 0 ||
			!topicId ||
			!type
		) {
			return res
				.status(400)
				.json({ message: "Please provide valid questions, topicId, and type" });
		}

		const topic = await Topic.findById(topicId);
		if (!topic) {
			return res.status(404).json({ message: "Topic not found" });
		}

		const formattedQuestions = questions.map((q) => {
			if (!q.questionText || !q.questionOption) {
				throw new Error(
					"Each question must have questionText and questionOption"
				);
			}

			return {
				questionText: q.questionText,
				questionOption: q.questionOption,
				questionRef:
					q.questionRef && typeof q.questionRef === "string"
						? q.questionRef
						: null,
				solution: q.solution || null,
				type,
				topicId: topic._id,
				createdBy: req.user._id,
			};
		});

		const savedQuestions = await Question.insertMany(formattedQuestions);

		res.status(201).json({
			message: "Questions created successfully",
			questions: savedQuestions,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error creating questions", error: error.message });
	}
};

const getAllQuestion = async (req, res) => {
	try {
		const { search, type, topicId, page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		let query = {};

		if (search) {
			const searchRegex = new RegExp(search.trim(), "i");
			query.$or = [
				{ questionText: searchRegex },
				{ "questionOption.text": searchRegex },
				{ questionRef: searchRegex },
				{ solution: searchRegex },
			];
		}

		if (type) {
			query.type = type;
		}

		if (topicId) {
			query.topicId = new mongoose.Types.ObjectId(topicId);
		}

		const questions = await Question.find(query)
			.populate("topicId", "name")
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 });

		const total = await Question.countDocuments(query);

		res.status(200).json({
			questions,
			totalPages: Math.ceil(total / limit),
			currentPage: parseInt(page),
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error fetching questions",
			error: error.message,
		});
	}
};

const updateQuestion = async (req, res) => {
	const { questionText, questionOption, questionRef, topicId, solution, type } =
		req.body;
	try {
		if (!questionText || !questionOption || !topicId || !type) {
			return res.status(400).json({ message: "Please fill all the fields" });
		}

		const topic = await Topic.findById(topicId);
		if (!topic) {
			return res.status(404).json({ message: "Topic not found" });
		}
		const question = await Question.findById(req.params.id);
		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}

		const questionUpdate = await Question.findByIdAndUpdate(
			req.params.id,
			{
				questionText,
				questionOption,
				questionRef,
				solution,
				type,
				topicId: topic._id,
			},
			{ new: true }
		);
		res.status(200).json(questionUpdate);
	} catch (error) {
		res.status(500).json({ message: "Error updating question", error });
	}
};

const deleteQuestion = async (req, res) => {
	try {
		const question = await Question.findById(req.params.id);
		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}
		await question.deleteOne();
		res.status(200).json({ message: "Question deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting question", error });
	}
};

// student panel read questions
const getSPQuestions = async (req, res) => {
	let { topicId, type } = req.body;

	try {
		if (!Array.isArray(topicId)) {
			return res.status(400).json({ message: "Invalid topicId format" });
		}
		if (!type) {
			return res.status(400).json({ message: "Please select a type" });
		}

		topicId = topicId.map((id) => new mongoose.Types.ObjectId(id));
		type = String(type);

		const questions = await Question.aggregate([
			{ $match: { topicId: { $in: topicId }, type: type } },
			{
				$addFields: {
					refCount: {
						$size: {
							$filter: {
								input: { $split: [{ $ifNull: ["$questionRef", ""] }, ", "] },
								as: "ref",
								cond: { $ne: ["$$ref", ""] },
							},
						},
					},
				},
			},
			{ $sort: { refCount: -1 } },
		]);

		//console.log("Questions found:", questions);

		res.status(200).json(questions);
	} catch (error) {
		//console.error("Error fetching questions:", error);
		res.status(500).json({ message: "Error fetching questions", error });
	}
};

const countTotalQuestion = async (req, res) => {
	try {
		const total = await Question.countDocuments();
		if (!total) {
			return res.status(500).json({
				success: false,
				message: "Something went wrong while counting question",
			});
		}
		res.status(200).json({
			success: true,
			message: "total amount of question retrieved",
			data: total,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Something went wrong while counting question",
			error,
		});
	}

	let { topicId, type, totalQuestion } = req.body;

	try {
		if (!Array.isArray(topicId)) {
			return res.status(400).json({ message: "Invalid topicId format" });
		}
		if (!totalQuestion || isNaN(totalQuestion) || totalQuestion <= 0) {
			return res.status(400).json({ message: "Invalid totalQuestion value" });
		}

		topicId = topicId.map((id) => new mongoose.Types.ObjectId(id));
		type = String(type);
		totalQuestion = parseInt(totalQuestion);

		let matchFilter = { topicId: { $in: topicId } };
		if (type !== "all") {
			matchFilter.type = type;
		}

		const questions = await Question.aggregate([
			{ $match: matchFilter },
			{
				$addFields: {
					refCount: {
						$size: {
							$filter: {
								input: { $split: [{ $ifNull: ["$questionRef", ""] }, ", "] },
								as: "ref",
								cond: { $ne: ["$$ref", ""] },
							},
						},
					},
				},
			},
			{ $sort: { refCount: -1 } },
			{ $limit: totalQuestion },
		]);

		//console.log("Questions found:", questions);

		res.status(200).json(questions);
	} catch (error) {
		//console.error("Error fetching questions:", error);
		res.status(500).json({ message: "Error fetching questions", error });
	}
};

export const questionController = {
	createQuestions,
	getAllQuestion,
	updateQuestion,
	deleteQuestion,
	getSPQuestions,
	countTotalQuestion,
};
