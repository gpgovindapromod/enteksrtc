import express from "express";
import { getUserDashboardData } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // Apply authentication middleware to all routes below

router.get("/dashboard", getUserDashboardData);

export default router;
