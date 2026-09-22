import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register, sendOtp, verifyOtpStep, verifyPhoneEmailUrl } from "../controllers/auth/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema } from "../validators/authValidators.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many login attempts, please try again later." }
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { success: false, message: "Too many OTP requests, please try again later." }
});

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", loginLimiter, validateRequest(loginSchema), login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/send-otp", otpLimiter, validateRequest(sendOtpSchema), sendOtp);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtpStep);

// This endpoint is unused/dummy. Let's comment it out or leave it disabled as per the plan
// router.post("/phone-email-verify", verifyPhoneEmailUrl);

export default router;