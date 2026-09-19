import express from "express";
import {createProfile, getProfile, updateProfile} from "../controllers/profileController.js"

import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router();

//Create profile 
router.post("/", authMiddleware, createProfile);

//edit profile
router.put("/",authMiddleware,updateProfile);

//get profile
router.get("/", authMiddleware, getProfile);

export default router;