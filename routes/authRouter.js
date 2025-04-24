import { Router } from "express";
import { authController } from "../controller/authController.js";


const authRouter = Router();


//register
authRouter.post("/register", authController.registerUser);

//login
authRouter.post("/login", authController.loginUser);

// logout

authRouter.get("/logout", authController.logoutUser);

//forgot Password
authRouter.post("/forgot-password", authController.forgetPassword);

//reset Password
authRouter.post("/reset-password", authController.resetPassword);

//verify user
authRouter.post("/verify", authController.verifyOTP);

export default authRouter;
