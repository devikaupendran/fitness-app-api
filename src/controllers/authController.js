// Import bcrypt for password hashing
import bcrypt from "bcryptjs";

// Create authentication tokens
import jwt from "jsonwebtoken";

// Import the user model
import User from "../models/User.js";


// ===============================
// SIGNUP CONTROLLER
// ===============================

const signup = async (req, res) => {
    try {
        // Get data from request body
        const {
            username,
            name,
            email,
            password,
            confirmPassword,
            confirm_password,
            height,
            weight,
            sex,
            gender,
            age,
            dailyCalories,
            waterGoal
        } = req.body;

        const effectiveConfirmPassword = confirmPassword !== undefined ? confirmPassword : confirm_password;
        const effectiveSex = (sex || gender)?.toString().trim().toLowerCase();

        // ===============================
        // CHECK REQUIRED FIELDS
        // (Mandatory: username, password, confirmPassword, email, height, weight, sex)
        // (Optional: name, age, dailyCalories, waterGoal)
        // ===============================

        if (
            !username || typeof username !== "string" || !username.trim() ||
            !email || typeof email !== "string" || !email.trim() ||
            !password || typeof password !== "string" ||
            !effectiveConfirmPassword ||
            height === undefined || height === null || height === "" ||
            weight === undefined || weight === null || weight === "" ||
            !effectiveSex
        ) {
            return res.status(400).json({
                message: "Please provide all required fields: username, password, confirm password, email, height, weight, and sex."
            });
        }


        // ===============================
        // CHECK PASSWORDS
        // ===============================

        if (password !== effectiveConfirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match. Please try again."
            });
        }


        // ===============================
        // VALIDATE EMAIL
        // ===============================

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Please provide a valid email address."
            });
        }


        // ===============================
        // VALIDATE SEX / GENDER
        // ===============================

        const allowedSex = ["male", "female", "other", "prefer_not_to_say"];
        if (!allowedSex.includes(effectiveSex)) {
            return res.status(400).json({
                message: "Sex must be either male, female, other, or prefer_not_to_say."
            });
        }


        // ===============================
        // VALIDATE HEIGHT & WEIGHT
        // ===============================

        if (Number.isNaN(Number(height)) || Number(height) <= 0) {
            return res.status(400).json({
                message: "Height must be a valid number greater than 0."
            });
        }

        if (Number.isNaN(Number(weight)) || Number(weight) <= 0) {
            return res.status(400).json({
                message: "Weight must be a valid number greater than 0."
            });
        }


        // ===============================
        // VALIDATE OPTIONAL FIELDS (if provided)
        // ===============================

        if (age !== undefined && (Number.isNaN(Number(age)) || Number(age) <= 0)) {
            return res.status(400).json({
                message: "Age must be greater than 0."
            });
        }

        if (dailyCalories !== undefined && (Number.isNaN(Number(dailyCalories)) || Number(dailyCalories) <= 0)) {
            return res.status(400).json({
                message: "Daily calorie goal must be greater than 0."
            });
        }

        if (waterGoal !== undefined && (Number.isNaN(Number(waterGoal)) || Number(waterGoal) <= 0)) {
            return res.status(400).json({
                message: "Water goal must be greater than 0."
            });
        }


        // ===============================
        // CHECK USERNAME UNIQUENESS
        // ===============================

        const existingUsername = await User.findOne({
            username: username.trim()
        });

        if (existingUsername) {
            return res.status(409).json({
                message: "This username is already in use. Please choose another one."
            });
        }


        // ===============================
        // CHECK EMAIL UNIQUENESS
        // ===============================

        const existingEmail = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingEmail) {
            return res.status(409).json({
                message: "An account with this email address already exists."
            });
        }


        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword = await bcrypt.hash(password, 10);


        // ===============================
        // CALCULATE DEFAULTS IF NOT PROVIDED
        // ===============================

        const calculatedDailyCalories = dailyCalories !== undefined ? Number(dailyCalories) : 2000;
        const calculatedWaterGoal = waterGoal !== undefined
            ? Number(waterGoal)
            : (effectiveSex === "female" ? Math.round(Number(weight) * 33) : Math.round(Number(weight) * 35));


        // ===============================
        // CREATE USER WITH PROFILE DATA
        // ===============================

        const user = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            profile: {
                name: name ? name.trim() : "",
                sex: effectiveSex,
                gender: effectiveSex,
                height: Number(height),
                weight: Number(weight),
                age: age !== undefined ? Number(age) : undefined,
                dailyCalories: calculatedDailyCalories,
                waterGoal: calculatedWaterGoal
            }
        });


        // ===============================
        // SEND RESPONSE
        // ===============================

        return res.status(201).json({
            message: "Your account has been created successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({
            message: "Something went wrong while creating your account. Please try again later."
        });
    }
};


// ===============================
// LOGIN CONTROLLER
// ===============================

const login = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        // Check required fields
        if (!username || !password) {
            return res.status(400).json({
                message: "Please provide your username and password."
            });
        }

        // Find user by username
        const user = await User.findOne({
            username: username.trim()
        });

        // User doesn't exist
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Password incorrect
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Successful login
        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            message: "Something went wrong while logging you in. Please try again later."
        });
    }
};


// Export controllers
export {
    signup,
    login
};