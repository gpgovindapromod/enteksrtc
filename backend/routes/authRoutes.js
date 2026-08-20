import express from "express";
import { login, logout, me, register, sendOtp, verifyOtpStep } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpStep);

export default router;