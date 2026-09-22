import express from "express";
import { getUserDashboardData } from "../controllers/user/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

export default router;
