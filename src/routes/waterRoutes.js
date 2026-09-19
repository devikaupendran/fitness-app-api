// Import Express
import express from "express";

// Import water goal controller
import { getWaterGoal,addWaterIntake ,getWaterHistory} from "../controllers/waterController.js";

// Import authentication middleware
import authMiddleware from "../middleware/authMiddleware.js";

// Create Express router
const router = express.Router();

// Get water goal for the logged-in user
// GET /api/water/goal
router.get("/goal", authMiddleware, getWaterGoal);

// Record water intake
// POST /api/water/intake
router.post( "/intake", authMiddleware, addWaterIntake);


// Get water intake history
// GET /api/water/history
router.get( "/history", authMiddleware,  getWaterHistory);

// Export router
export default router;