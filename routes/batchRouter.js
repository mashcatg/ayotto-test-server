import { Router } from "express";
import { batchController } from "../controller/batchController.js";
import auth from "../middleware/auth.js";


const batchRouter = Router();

//create batches
batchRouter.post('/', auth("admin"),   batchController.createBatch);

// Get Batches
batchRouter.get('/', batchController.getAllBatch );

// Update Batch
batchRouter.put('/:id', auth("admin"), batchController.updateBatch );

// Delete Batch
batchRouter.delete('/:id', auth("admin"),   batchController.deleteBatch );

export default batchRouter;