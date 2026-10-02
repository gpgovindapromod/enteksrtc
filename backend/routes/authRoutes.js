import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register, verifyOtpStep } from "../controllers/auth/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema, verifyOtpSchema } from "../validators/authValidators.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many login attempts, please try again later." }
});

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", loginLimiter, validateRequest(loginSchema), login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtpStep);

export default router;