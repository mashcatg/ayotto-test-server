import express from "express";
import { adminController } from "../controller/adminController.js";

const adminRouter = express.Router();

// keep admin logs

adminRouter.post("/logs/:userId", adminController.createLogs);

// get all logs

adminRouter.get("/logs", adminController.getAllLogs);

// create a new admin

adminRouter.post("/create", adminController.createAdmin);

// make a user as admin

adminRouter.put("/make-admin/:userId", adminController.makeUserAsAdmin);

// get all admins 

adminRouter.get("/all-admins", adminController.getAllAdmin);

// get admin by id

adminRouter.get("/:adminId", adminController.getAdminById);

export default adminRouter;
