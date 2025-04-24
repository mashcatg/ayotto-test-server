import { Batch } from "../models/batchModel.js";
import { Group } from "../models/groupModel.js";
import { Subject } from "../models/subjectModel.js";
import { Chapter } from "../models/chapterModel.js";

const createChapter = async (req, res) => {
	const { name, subjectId } = req.body;
	try {
		if (!name || !subjectId) {
			return res
				.status(400)
				.json({ success: false, message: "Please fill all the fields" });
		}

		const subject = await Subject.findById(subjectId);
		if (!subject) {
			return res
				.status(404)
				.json({ success: false, message: "Subject not found" });
		}

		const chapter = new Chapter({
			name,
			subjectId: subject._id,
			createdBy: req.user._id,
		});

		await chapter.save();
		res.status(201).json({ success: true, data: chapter });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error creating chapter", error });
	}
};

const getAllChapter = async (req, res) => {
	try {
		const chapters = await Chapter.find()
			.populate("createdBy")
			.populate({
				path: "subjectId",
				populate: [
					{ path: "batchId" }, 
					{ path: "groupId" }, 
				],
			});
		res.status(200).json({ success: true, data: chapters });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error fetching chapters", error });
	}
};

const updateChapter = async (req, res) => {
	const { name, batchId, groupId, subjectId } = req.body;
	try {
		if (!name || !batchId || !subjectId) {
			return res
				.status(400)
				.json({ success: false, message: "Please fill all the fields" });
		}
		const batch = await Batch.findById(batchId);
		const subject = await Subject.findById(subjectId);
		const chapter = await Chapter.findById(req.params.id);
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
		const chapterUpdate = await Chapter.findByIdAndUpdate(
			req.params.id,
			{
				name,
				batchId: batch._id,
				groupId: groupIdFinal,
				subjectId: subject._id,
			},
			{ new: true }
		);
		res.status(200).json({ success: true, data: chapterUpdate });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error updating chapter", error });
	}
};

const deleteChapter = async (req, res) => {
	try {
		const chapter = await Chapter.findById(req.params.id);
		if (!chapter) {
			return res
				.status(404)
				.json({ success: false, message: "Chapter not found" });
		}
		await chapter.deleteOne();
		res
			.status(200)
			.json({ success: true, message: "Chapter deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error deleting chapter", error });
	}
};

export const chapterController = {
	createChapter,
	getAllChapter,
	updateChapter,
	deleteChapter,
};
