import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        // Legacy root fields fallback in case older documents stored them at root
        name: { type: String, trim: true },
        sex: { type: String },
        gender: { type: String },
        height: { type: Number },
        weight: { type: Number },
        age: { type: Number },
        dailyCalories: { type: Number },
        waterGoal: { type: Number },

        profile: {
            name: {
                type: String,
                trim: true,
                default: ""
            },
            sex: {
                type: String,
                enum: ["male", "female", "other", "prefer_not_to_say", null],
                trim: true,
                lowercase: true,
                default: null
            },
            gender: {
                type: String,
                enum: ["male", "female", "other", "prefer_not_to_say", null],
                trim: true,
                lowercase: true,
                default: null
            },
            height: {
                type: Number,
                default: null
            },
            weight: {
                type: Number,
                default: null
            },
            age: {
                type: Number,
                default: null
            },
            dailyCalories: {
                type: Number,
                min: 1,
                default: 2000
            },
            waterGoal: {
                type: Number,
                min: 1,
                default: 2500
            },
        },
    },
    {
        timestamps: true,
        strict: false
    }
);

// Method to guarantee all profile fields are returned and healed from legacy root fields if needed
userSchema.methods.getFormattedProfile = function () {
    const p = this.profile || {};
    const sex = p.sex || p.gender || this.get("sex") || this.get("gender") || null;
    const gender = p.gender || p.sex || this.get("gender") || this.get("sex") || null;
    const height = (p.height !== undefined && p.height !== null)
        ? Number(p.height)
        : (this.get("height") !== undefined && this.get("height") !== null ? Number(this.get("height")) : null);
    const weight = (p.weight !== undefined && p.weight !== null)
        ? Number(p.weight)
        : (this.get("weight") !== undefined && this.get("weight") !== null ? Number(this.get("weight")) : null);
    const age = (p.age !== undefined && p.age !== null)
        ? Number(p.age)
        : (this.get("age") !== undefined && this.get("age") !== null ? Number(this.get("age")) : null);
    const dailyCalories = (p.dailyCalories !== undefined && p.dailyCalories !== null)
        ? Number(p.dailyCalories)
        : (this.get("dailyCalories") !== undefined && this.get("dailyCalories") !== null ? Number(this.get("dailyCalories")) : 2000);
    const waterGoal = (p.waterGoal !== undefined && p.waterGoal !== null)
        ? Number(p.waterGoal)
        : (this.get("waterGoal") !== undefined && this.get("waterGoal") !== null ? Number(this.get("waterGoal")) : 2500);

    const formatted = {
        name: p.name || this.get("name") || "",
        sex,
        gender,
        height,
        weight,
        age,
        dailyCalories,
        waterGoal
    };

    // Auto-heal profile in DB if root fields were present but profile subdocument was missing them
    if ((!this.profile?.height && height) || (!this.profile?.sex && sex)) {
        this.profile = formatted;
        this.save().catch(() => {});
    }

    return formatted;
};

// create a Mongodb model using the User Schema
// "User" will be used to interact with the users collection
const User = mongoose.model("User", userSchema);

// Export the User model
// Other files such as controllers can import and use this model
export default User;