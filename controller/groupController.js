import { Batch } from "../models/batchModel.js";
import { Group } from "../models/groupModel.js";

const createGroup = async (req, res) => {
	const { name, batchId } = req.body;
	try {
		if (!name || !batchId) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const batch = await Batch.findById(batchId);
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}
		const group = new Group({
			name,
			batchId: batch._id,
			createdBy: req.user._id,
		});
		await group.save();
		res.status(201).json({ success: true, data: group });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error creating group", error });
	}
};

const getAllGroup = async (req, res) => {
	try {
		const groups = await Group.find().populate("createdBy batchId");
		//console.log(groups);
		res.status(200).json({ success: true, data: groups });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error fetching groups", error });
	}
};

const updateGroup = async (req, res) => {
	const { name, batchId } = req.body;
	try {
		const batch = await Batch.findById(batchId);
		const group = await Group.findById(req.params.id);
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}
		if (!group) {
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });
		}
		const groupUpdated = await Group.findByIdAndUpdate(
			req.params.id,
			{ name, batchId: batch._id },
			{ new: true }
		);
		res.status(200).json({ success: true, data: groupUpdated });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error updating group", error });
	}
};

const deleteGroup = async (req, res) => {
	try {
		const group = await Group.findById(req.params.id);
		if (!group) {
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });
		}
		await group.deleteOne();
		res
			.status(200)
			.json({ success: true, message: "Group deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error deleting group", error });
	}
};

export const groupController = {
	createGroup,
	getAllGroup,
	updateGroup,
	deleteGroup,
};
