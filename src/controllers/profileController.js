import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ===============================
// CREATE PROFILE (POST /api/profile)
// ===============================
const createProfile = async (req, res) => {
    try {
        const {
            name,
            sex,
            gender,
            height,
            weight,
            age,
            dailyCalories,
            waterGoal
        } = req.body;

        // Check whether profile already exists
        if (req.user.profile?.height && req.user.profile?.weight) {
            return res.status(400).json({
                message: "A profile already exists for this account."
            });
        }

        const effectiveSex = (sex || gender)?.toString().trim().toLowerCase();

        // Validate mandatory profile fields
        // (Mandatory: height, weight, sex; Optional: name, age, dailyCalories, waterGoal)
        if (
            height === undefined || height === null || height === "" ||
            weight === undefined || weight === null || weight === "" ||
            !effectiveSex
        ) {
            return res.status(400).json({
                message: "Please provide mandatory profile fields: height, weight, and sex."
            });
        }

        // Validate sex
        const allowedSex = ["male", "female", "other", "prefer_not_to_say"];
        if (!allowedSex.includes(effectiveSex)) {
            return res.status(400).json({
                message: "Sex must be either male, female, other, or prefer_not_to_say."
            });
        }

        // Validate numbers
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

        if (age !== undefined && (Number.isNaN(Number(age)) || Number(age) <= 0)) {
            return res.status(400).json({
                message: "Age must be greater than 0."
            });
        }

        if (dailyCalories !== undefined && (Number.isNaN(Number(dailyCalories)) || Number(dailyCalories) <= 0)) {
            return res.status(400).json({
                message: "Daily calories goal must be greater than 0."
            });
        }

        if (waterGoal !== undefined && (Number.isNaN(Number(waterGoal)) || Number(waterGoal) <= 0)) {
            return res.status(400).json({
                message: "Water goal must be greater than 0."
            });
        }

        const calculatedWaterGoal = waterGoal !== undefined
            ? Number(waterGoal)
            : (effectiveSex === "female" ? Math.round(Number(weight) * 33) : Math.round(Number(weight) * 35));
        const calculatedDailyCalories = dailyCalories !== undefined ? Number(dailyCalories) : 2000;

        req.user.profile = {
            name: name ? name.trim() : "",
            sex: effectiveSex,
            gender: effectiveSex,
            height: Number(height),
            weight: Number(weight),
            age: age !== undefined ? Number(age) : undefined,
            dailyCalories: calculatedDailyCalories,
            waterGoal: calculatedWaterGoal
        };

        req.user.markModified("profile");
        await req.user.save();

        return res.status(201).json({
            message: "Profile created successfully.",
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile
        });

    } catch (error) {
        console.error("Create profile error:", error.message);
        return res.status(500).json({
            message: "Unable to create your profile at this time. Please try again later."
        });
    }
};


// ===============================
// GET PROFILE (GET /api/profile)
// ===============================
const getProfile = async (req, res) => {
    try {
        return res.status(200).json({
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile
        });
    } catch (error) {
        console.error("Get profile error:", error.message);
        return res.status(500).json({
            message: "Unable to retrieve your profile at this time. Please try again later."
        });
    }
};


// ===============================
// UPDATE PROFILE (PUT /api/profile)
// Can edit all things except username
// ===============================
const updateProfile = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            confirmPassword,
            confirm_password,
            name,
            sex,
            gender,
            height,
            weight,
            age,
            dailyCalories,
            waterGoal
        } = req.body;

        // Disallow editing username
        if (username !== undefined && username.trim() !== req.user.username) {
            return res.status(400).json({
                message: "Username cannot be changed."
            });
        }

        let updatedAnyField = false;

        // Ensure profile subdocument exists
        if (!req.user.profile) {
            req.user.profile = {};
        }

        // Update email if provided
        if (email !== undefined) {
            const trimmedEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                return res.status(400).json({
                    message: "Please provide a valid email address."
                });
            }

            if (trimmedEmail !== req.user.email) {
                const existingEmail = await User.findOne({
                    email: trimmedEmail,
                    _id: { $ne: req.user._id }
                });

                if (existingEmail) {
                    return res.status(409).json({
                        message: "An account with this email address already exists."
                    });
                }

                req.user.email = trimmedEmail;
                updatedAnyField = true;
            }
        }

        // Update password if provided
        if (password !== undefined) {
            const effectiveConfirm = confirmPassword !== undefined ? confirmPassword : confirm_password;
            if (effectiveConfirm && password !== effectiveConfirm) {
                return res.status(400).json({
                    message: "Passwords do not match. Please try again."
                });
            }

            req.user.password = await bcrypt.hash(password, 10);
            updatedAnyField = true;
        }

        // Update name
        if (name !== undefined) {
            req.user.profile.name = name.trim();
            updatedAnyField = true;
        }

        // Update sex / gender
        if (sex !== undefined || gender !== undefined) {
            const effectiveSex = (sex || gender)?.toString().trim().toLowerCase();
            const allowedSex = ["male", "female", "other", "prefer_not_to_say"];
            if (!allowedSex.includes(effectiveSex)) {
                return res.status(400).json({
                    message: "Sex must be either male, female, other, or prefer_not_to_say."
                });
            }
            req.user.profile.sex = effectiveSex;
            req.user.profile.gender = effectiveSex;
            updatedAnyField = true;
        }

        // Update height
        if (height !== undefined) {
            const heightNum = Number(height);
            if (Number.isNaN(heightNum) || heightNum <= 0) {
                return res.status(400).json({
                    message: "Height must be a valid number greater than 0."
                });
            }
            req.user.profile.height = heightNum;
            updatedAnyField = true;
        }

        // Update weight
        if (weight !== undefined) {
            const weightNum = Number(weight);
            if (Number.isNaN(weightNum) || weightNum <= 0) {
                return res.status(400).json({
                    message: "Weight must be a valid number greater than 0."
                });
            }
            req.user.profile.weight = weightNum;
            updatedAnyField = true;
        }

        // Update age
        if (age !== undefined) {
            const ageNum = Number(age);
            if (Number.isNaN(ageNum) || ageNum <= 0) {
                return res.status(400).json({
                    message: "Age must be a valid number greater than 0."
                });
            }
            req.user.profile.age = ageNum;
            updatedAnyField = true;
        }

        // Update dailyCalories
        if (dailyCalories !== undefined) {
            const caloriesNum = Number(dailyCalories);
            if (Number.isNaN(caloriesNum) || caloriesNum <= 0) {
                return res.status(400).json({
                    message: "Daily calories goal must be a valid number greater than 0."
                });
            }
            req.user.profile.dailyCalories = caloriesNum;
            updatedAnyField = true;
        }

        // Update waterGoal
        if (waterGoal !== undefined) {
            const waterNum = Number(waterGoal);
            if (Number.isNaN(waterNum) || waterNum <= 0) {
                return res.status(400).json({
                    message: "Water goal must be a valid number greater than 0."
                });
            }
            req.user.profile.waterGoal = waterNum;
            updatedAnyField = true;
        }

        if (!updatedAnyField) {
            return res.status(400).json({
                message: "Please provide at least one valid field to update."
            });
        }

        req.user.markModified("profile");
        await req.user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile
        });

    } catch (error) {
        console.error("Update profile error:", error.message);
        return res.status(500).json({
            message: "Unable to update your profile at this time. Please try again later."
        });
    }
};

export {
    createProfile,
    getProfile,
    updateProfile
};