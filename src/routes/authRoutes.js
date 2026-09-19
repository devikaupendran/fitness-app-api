//import express
import express from "express";

//import signup controller
import signup from "../controllers/authController.js";

//create an express router
const router = express.Router();

//signup API
//POST /api/auth/signup
router.post("/signup", signup);

//export the router
export default router;