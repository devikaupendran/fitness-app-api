// Import the WaterIntake model
import WaterIntake from "../models/WaterIntake.js";
import { formatInTimeZone } from "date-fns-tz";

// Calculate today's water progress
const calculateWaterProgress = async (user, waterGoal) => {

    // Get today's start time
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's end time
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's water intake records
    const waterIntakes = await WaterIntake.find({
        userId: user._id,
        consumedAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // Calculate total water consumed today
    const consumed = waterIntakes.reduce(
        (total, intake) => total + intake.amount,
        0
    );

    // Calculate remaining water
    const remaining = Math.max(waterGoal - consumed, 0);

    // Calculate completion percentage
    const percentage = Math.min(
        (consumed / waterGoal) * 100,
        100
    );

    return {
        consumed,
        remaining,
        percentage
    };
};


// Controller to calculate the user's daily water goal
const getWaterGoal = async (req, res) => {

    try {

        // Get the logged-in user's profile
        const user = req.user;

        // Get weight and gender from the profile
        const weight = user.profile?.weight;
        const gender = user.profile?.gender?.toLowerCase();

        // Check whether weight is available
        if (!weight) {

            return res.status(400).json({
                message: "Please update your weight in your profile"
            });

        }

        // Check whether gender is available
        if (!gender) {

            return res.status(400).json({
                message: "Please update your gender in your profile"
            });

        }

        // Determine water requirement based on gender
        let waterPerKg;

        if (gender === "male") {

            waterPerKg = 35;

        } else if (gender === "female") {

            waterPerKg = 33;

        } else {

            return res.status(400).json({
                message: "Invalid gender in profile"
            });

        }

        // Calculate daily water goal
        const waterGoal = weight * waterPerKg;

        // Get today's water progress
        const {
            consumed,
            remaining,
            percentage
        } = await calculateWaterProgress(
            user,
            waterGoal
        );

        // Send the water goal and progress
        return res.status(200).json({

            message: "Daily water goal retrieved successfully",

            waterGoal: {
                ml: waterGoal,
                litres: Number((waterGoal / 1000).toFixed(2))
            },

            waterConsumed: {
                ml: consumed,
                litres: Number((consumed / 1000).toFixed(2))
            },

            remaining: {
                ml: remaining,
                litres: Number((remaining / 1000).toFixed(2))
            },

            percentage: Number(percentage.toFixed(2))

        });

    } catch (error) {

        console.error(
            "Water goal calculation error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to retrieve daily water goal"
        });

    }
};


// Add water intake
const addWaterIntake = async (req, res) => {

    try {

        // Get amount and consumed time from request body
        const {
            amount,
            consumedAt
        } = req.body;

        // Check whether amount is provided
        if (amount === undefined || amount === null) {

            return res.status(400).json({
                message: "Water intake amount is required"
            });

        }

        // Check whether amount is a valid number
        if (typeof amount !== "number" || amount <= 0) {

            return res.status(400).json({
                message: "Water intake amount must be a positive number"
            });

        }

        // Use provided time or current time
        const intakeTime = consumedAt
            ? new Date(consumedAt)
            : new Date();

        // Check whether date is valid
        if (Number.isNaN(intakeTime.getTime())) {

            return res.status(400).json({
                message: "The provided consumption time is invalid"
            });

        }

        // Create water intake record
        const waterIntake = await WaterIntake.create({

            userId: req.user._id,
            amount,
            consumedAt: intakeTime

        });

        // Get user profile
        const user = req.user;

        // Get weight and gender
        const weight = user.profile?.weight;
        const gender = user.profile?.gender?.toLowerCase();

        // Calculate daily water goal
        let waterPerKg;

        if (gender === "male") {

            waterPerKg = 35;

        } else if (gender === "female") {

            waterPerKg = 33;

        } else {

            return res.status(400).json({
                message: "Invalid gender in profile"
            });

        }

        const waterGoal = weight * waterPerKg;

        // Get updated daily progress
        const {
            consumed,
            remaining,
            percentage
        } = await calculateWaterProgress(
            user,
            waterGoal
        );

        // Send updated water progress
        return res.status(201).json({

            message: "Water intake added successfully",

            waterIntake: {
                id: waterIntake._id,
                amount: waterIntake.amount,
                consumedAt: waterIntake.consumedAt
            },

            waterProgress: {
                goal: waterGoal,
                consumed,
                remaining,
                percentage: Number(percentage.toFixed(2))
            }

        });

    } catch (error) {

        console.error(
            "Add water intake error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to record water intake. Please try again later."
        });

    }
};

// Controller to get the user's water intake history
const getWaterHistory = async (req, res) => {

    try {

        // Get the logged-in user's ID
        // authMiddleware has already added the user to req.user
        const userId = req.user._id;

        // Find all water intake records belonging to this user
        // Sort by consumedAt in descending order
        // so the latest intake appears first
        const history = await WaterIntake.find({
            userId: userId
        })
            .sort({ consumedAt: -1 })
            .select("_id amount consumedAt");

        // Send the water intake history
        return res.status(200).json({

            message: "Water intake history retrieved successfully",

            history: history.map((intake) => ({

                // Water intake record ID
                id: intake._id,

                // Amount consumed in millilitres
                date: formatInTimeZone(
                    intake.consumedAt,
                    "Asia/Kolkata",
                    "dd MMM yyyy"
                ),

                // Time when the water was consumed
                // Formatted time
                time: formatInTimeZone(
                    intake.consumedAt,
                    "Asia/Kolkata",
                    "hh:mm a"
                )

            }))

        });

    } catch (error) {

        // Handle unexpected errors
        console.error(
            "Water history error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to retrieve water intake history"
        });

    }
};


// Export controllers
export {
    getWaterHistory,
    getWaterGoal,
    addWaterIntake
};