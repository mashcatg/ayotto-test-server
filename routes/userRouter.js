import express from "express";
import { userController } from "../controller/userController.js";
import auth from "../middleware/auth.js";

const userRouter = express.Router();

// get all users
userRouter.get("/all-users", userController.getAllUsers);

// get user by phone

userRouter.get("/:phone", userController.getUserByPhone);

// check if user already exist

userRouter.get("/is-user-exist/:phone", userController.isUserAlreadyExist);

// get user by batch and group

userRouter.post("/batch-group", userController.getUserByBatchAndGroup);

// ban a user

userRouter.put("/ban/:userId", userController.bannedUser);

// delete a user

userRouter.delete("/delete/:userId", userController.deleteUser);

// update a user

userRouter.put("/update/:userId", userController.updateUser);

// Profile routes
userRouter.get("/profile/:userId", auth("user", "admin"), userController.getProfileDetails);
userRouter.get("/stats/:userId", auth("user"), userController.getUserStats);
userRouter.get("/weekly-progress/:userId", auth("user"), userController.getWeeklyProgress);

// Edit profile route
userRouter.put("/profile/edit", auth("user"), userController.editProfile);

// Add admin stats route
userRouter.get("/admin-stats/:userId", auth("admin"), userController.getAdminStats);

export default userRouter;
