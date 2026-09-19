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
        profile: {
            name: {
                type: String,
                trim: true,
            },
            gender: {
                type: String,
                trim: true,
            },
            height: {
                type: Number,
            },
            weight: {
                type: Number,
            },
            age: { 
                type: Number,
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
export default User;