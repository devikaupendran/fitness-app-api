// Import Express
import express from "express";

// Import water goal controller
import getWaterGoal from "../controllers/waterController.js";

// Import authentication middleware
import authMiddleware from "../middleware/authMiddleware.js";

// Create Express router
const router = express.Router();

// Get water goal for the logged-in user
// GET /api/water/goal
router.get("/goal", authMiddleware, getWaterGoal);

// Export router
export default router;