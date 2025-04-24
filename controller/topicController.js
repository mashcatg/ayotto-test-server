import { Batch } from "../models/batchModel.js";
import { Group } from "../models/groupModel.js";
import { Subject } from "../models/subjectModel.js";
import { Chapter } from "../models/chapterModel.js";
import { Topic } from "../models/topicModel.js";

const createTopic = async (req, res) => {
	const { name, chapterId } = req.body;
	try {
		if (!name || !chapterId) {
			return res
				.status(400)
				.json({ success: false, message: "Please fill all the fields" });
		}

		const chapter = await Chapter.findById(chapterId);
		if (!chapter) {
			return res
				.status(404)
				.json({ success: false, message: "Chapter not found" });
		}

		const topic = new Topic({
			name,
			chapterId: chapter._id,
			createdBy: req.user._id
		});

		await topic.save();
		res.status(201).json({ success: true, data: topic });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error creating topic", error });
	}
};

const getAllTopics = async (req, res) => {
	try {
		const topics = await Topic.find()
			.populate("createdBy")
			.populate({
				path: "chapterId",
				populate: {
					path: "subjectId",
					populate: {
						path: "groupId batchId",
					},
				},
			});

		res.status(200).json({ success: true, data: topics });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching topics",
			error: error.message,
		});
	}
};


const updateTopic = async (req, res) => {
	const { name, batchId, groupId, subjectId, chapterId } = req.body;
	try {
		if (!name || !batchId || !subjectId || !chapterId) {
			return res
				.status(400)
				.json({ success: false, message: "Please fill all the fields" });
		}
		const batch = await Batch.findById(batchId);
		const subject = await Subject.findById(subjectId);
		const chapter = await Chapter.findById(chapterId);
		const topic = await Topic.findById(req.params.id);
		if (!subject) {
			return res
				.status(404)
				.json({ success: false, message: "Subject not found" });
		}
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}
		if (!chapter) {
			return res
				.status(404)
				.json({ success: false, message: "Chapter not found" });
		}
		if (!topic) {
			return res
				.status(404)
				.json({ success: false, message: "Topic not found" });
		}
		let groupIdFinal = null;
		if (groupId) {
			const group = await Group.findById(groupId);
			if (!group) {
				return res
					.status(404)
					.json({ success: false, message: "Group not found" });
			}
			groupIdFinal = group._id;
		}
		const topicUpdate = await Topic.findByIdAndUpdate(
			req.params.id,
			{
				name,
				batchId: batch._id,
				groupId: groupIdFinal,
				subjectId: subject._id,
				chapterId: chapter._id,
			},
			{ new: true }
		);
		res.status(200).json({ success: true, data: topicUpdate });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error updating topic", error });
	}
};

const deleteTopic = async (req, res) => {
	try {
		const topic = await Topic.findById(req.params.id);
		if (!topic) {
			return res
				.status(404)
				.json({ success: false, message: "Topic not found" });
		}
		await topic.deleteOne();
		res
			.status(200)
			.json({ success: true, message: "Topic deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error deleting topic", error });
	}
};

export const topicController = {
	createTopic,
	getAllTopics,
	updateTopic,
	deleteTopic,
};
