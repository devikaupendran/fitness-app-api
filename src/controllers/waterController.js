// Import the WaterIntake model
import WaterIntake from "../models/WaterIntake.js";

// Import timezone formatter
import { formatInTimeZone } from "date-fns-tz";


// ==========================================
// Calculate today's water progress
// ==========================================

const calculateWaterProgress = async (userId, waterGoal) => {

    // Get today's start time
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's end time
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's water intake records
    const waterIntakes = await WaterIntake.find({
        userId,
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
    const percentage =
        waterGoal > 0
            ? Math.min((consumed / waterGoal) * 100, 100)
            : 0;

    return {
        consumed,
        remaining,
        percentage
    };
};


// ==========================================
// Get today's water goal and progress
// ==========================================

const getWaterGoal = async (req, res) => {

    try {

        // Get water goal from logged-in user's profile
        const waterGoal = req.user.profile?.waterGoal;

        // Check whether water goal exists
        if (!waterGoal) {

            return res.status(400).json({
                message: "Please set your daily water goal in your profile."
            });

        }

        // Get today's progress
        const {
            consumed,
            remaining,
            percentage
        } = await calculateWaterProgress(
            req.user._id,
            waterGoal
        );

        // Send water goal and progress
        return res.status(200).json({

            message: "Daily water goal retrieved successfully",

            waterGoal: {
                ml: waterGoal,
                litres: Number(
                    (waterGoal / 1000).toFixed(2)
                )
            },

            waterConsumed: {
                ml: consumed,
                litres: Number(
                    (consumed / 1000).toFixed(2)
                )
            },

            remaining: {
                ml: remaining,
                litres: Number(
                    (remaining / 1000).toFixed(2)
                )
            },

            percentage: Number(
                percentage.toFixed(2)
            )
        });

    } catch (error) {

        console.error(
            "Get water goal error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to retrieve daily water goal."
        });
    }
};


// ==========================================
// Add water intake
// ==========================================

const addWaterIntake = async (req, res) => {

    try {

        // Get amount and consumed time
        const {
            amount,
            consumedAt
        } = req.body;


        // Check amount
        if (amount === undefined || amount === null) {

            return res.status(400).json({
                message: "Water intake amount is required."
            });
        }


        // Convert amount to number
        const waterAmount = Number(amount);


        // Validate amount
        if (
            Number.isNaN(waterAmount) ||
            waterAmount <= 0
        ) {

            return res.status(400).json({
                message:
                    "Water intake amount must be a positive number."
            });
        }


        // Get user's water goal
        const waterGoal = req.user.profile?.waterGoal;


        // Check whether water goal exists
        if (!waterGoal) {

            return res.status(400).json({
                message:
                    "Please set your daily water goal in your profile."
            });
        }


        // Use provided time or current time
        const intakeTime = consumedAt
            ? new Date(consumedAt)
            : new Date();


        // Validate date
        if (Number.isNaN(intakeTime.getTime())) {

            return res.status(400).json({
                message:
                    "The provided consumption time is invalid."
            });
        }


        // Create water intake record
        const waterIntake = await WaterIntake.create({

            userId: req.user._id,

            amount: waterAmount,

            consumedAt: intakeTime
        });


        // Calculate updated daily progress
        const {
            consumed,
            remaining,
            percentage
        } = await calculateWaterProgress(
            req.user._id,
            waterGoal
        );


        // Send updated progress
        return res.status(201).json({

            message: "Water intake added successfully.",

            waterIntake: {
                id: waterIntake._id,
                amount: waterIntake.amount,
                consumedAt: waterIntake.consumedAt
            },

            waterProgress: {

                goal: waterGoal,

                consumed,

                remaining,

                percentage: Number(
                    percentage.toFixed(2)
                )
            }
        });

    } catch (error) {

        console.error(
            "Add water intake error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Unable to record water intake. Please try again later."
        });
    }
};


// ==========================================
// Get water intake history
// ==========================================

const getWaterHistory = async (req, res) => {

    try {

        // Get logged-in user's ID
        const userId = req.user._id;


        // Find user's water intake records
        const history = await WaterIntake.find({
            userId
        })
            .sort({
                consumedAt: -1
            })
            .select("_id amount consumedAt");


        // Format history for mobile app
        return res.status(200).json({

            message:  "Water intake history retrieved successfully.",

            history: history.map((intake) => ({

                id: intake._id,

                // Amount in ml
                amount: intake.amount,

                // Date
                date: formatInTimeZone(
                    intake.consumedAt,
                    "Asia/Kolkata",
                    "dd MMM yyyy"
                ),

                // Time
                time: formatInTimeZone(
                    intake.consumedAt,
                    "Asia/Kolkata",
                    "hh:mm a"
                ),

                // Original timestamp
                consumedAt: intake.consumedAt
            }))
        });

    } catch (error) {

        console.error(
            "Water history error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to retrieve water intake history."
        });
    }
};


// ==========================================
// Export controllers
// ==========================================

export {
    getWaterHistory,
    getWaterGoal,
    addWaterIntake
};