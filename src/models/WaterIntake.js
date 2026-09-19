// Import Mongoose
import mongoose from "mongoose";

// Create schema for water intake records
const waterIntakeSchema = new mongoose.Schema(
    {
        // ID of the user who drank the water
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Amount of water consumed in millilitres
        amount: {
            type: Number,
            required: true,
            min: 1
        },

        // Date and time when the user consumed the water
        consumedAt: {
            type: Date,
            required: true
        }
    },

    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }
);

// Create the WaterIntake model
const WaterIntake = mongoose.model(
    "WaterIntake",
    waterIntakeSchema
);

// Export the model
export default WaterIntake;