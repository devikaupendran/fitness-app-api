//import express
import express from "express";

//import authentication controllers
import {signup, login} from "../controllers/authController.js"
import loginLimiter from "../middleware/loginLimiter.js";

//create an express router
const router = express.Router();

//signup API
//POST /api/auth/signup
router.post("/signup", signup);


// Login API
// POST /api/auth/login
router.post("/login", loginLimiter, login);

//export the router
export default router;