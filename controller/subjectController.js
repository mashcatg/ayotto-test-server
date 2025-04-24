import { Batch } from "../models/batchModel.js";
import { Group } from "../models/groupModel.js";
import { Subject } from "../models/subjectModel.js";

const createSubject = async (req, res) => {
	const { name, groupId, batchId } = req.body;
	//console.log(req.body);
	try {
		if (!name || !batchId) {
			return res
				.status(400)
				.json({ success: false, message: "Name and Batch is required" });
		}

		let groupIdFinal = groupId && groupId.trim() !== "" ? groupId : null;
		if (groupIdFinal) {
			const group = await Group.findById(groupIdFinal);
			if (!group) {
				return res
					.status(404)
					.json({ success: false, message: "Group not found" });
			}
		}
		const batch = await Batch.findById(batchId);
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}

		const subject = new Subject({
			name,
			groupId: groupIdFinal,
			batchId,
			createdBy: req.user._id,
		});

		await subject.save();
		res.status(201).json({ success: true, data: subject });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error creating subject", error });
	}
};

const getAllSubject = async (req, res) => {
	try {
		const subjects = await Subject.find()
			.populate("createdBy")
			.populate("groupId")
			.populate("batchId");
		res.status(200).json({ success: true, data: subjects });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error fetching subjects", error });
	}
};

const updateSubject = async (req, res) => {
	const { name, batchId, groupId } = req.body;
	try {
		if (!name || !batchId) {
			return res
				.status(400)
				.json({ success: false, message: "Name and Batch are required" });
		}
		const batch = await Batch.findById(batchId);
		const subject = await Subject.findById(req.params.id);
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
		const subjectUpdate = await Subject.findByIdAndUpdate(
			req.params.id,
			{ name, batchId: batch._id, groupId: groupIdFinal },
			{ new: true }
		);
		res.status(200).json({ success: true, data: subjectUpdate });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error updating subject", error });
	}
};

const deleteSubject = async (req, res) => {
	try {
		const subject = await Subject.findById(req.params.id);
		if (!subject) {
			return res
				.status(404)
				.json({ success: false, message: "Subject not found" });
		}
		await subject.deleteOne();
		res
			.status(200)
			.json({ success: true, message: "Subject deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error deleting subject", error });
	}
};

export const subjectController = {
	createSubject,
	getAllSubject,
	updateSubject,
	deleteSubject,
};
