import { Batch } from "../models/batchModel.js";

const createBatch = async (req, res) => {
	const { name, session, status } = req.body;
	//console.log(req.body);
	try {
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "Batch name is required" });
		}
		if (!status) {
			return res
				.status(400)
				.json({ success: false, message: "Batch status is required" });
		}
		const batch = new Batch({ name, session, status, createdBy: req.user._id });
		await batch.save();
		res.status(201).json({ success: true, data: batch });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error creating batch", error });
	}
};

const getAllBatch = async (req, res) => {
	try {
		const batches = await Batch.find();
		res.status(200).json({ success: true, data: batches });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error fetching batches", error });
	}
};

const updateBatch = async (req, res) => {
	const { name, session, status } = req.body;
	try {
		const batch = await Batch.findById(req.params.id);
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}
		if (!name || !status) {
			return res
				.status(400)
				.json({ success: false, message: "Batch name & status are required" });
		}
		batch.name = name;
		batch.session = session;
		batch.status = status;
		await batch.save();
		res.status(200).json({ success: true, data: batch });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error updating batch", error });
	}
};

const deleteBatch = async (req, res) => {
	try {
		const batch = await Batch.findById(req.params.id);
		if (!batch) {
			return res
				.status(404)
				.json({ success: false, message: "Batch not found" });
		}
		await batch.deleteOne();
		res
			.status(200)
			.json({ success: true, message: "Batch deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Error deleting batch", error });
	}
};

export const batchController = {
	createBatch,
	getAllBatch,
	updateBatch,
	deleteBatch,
};
