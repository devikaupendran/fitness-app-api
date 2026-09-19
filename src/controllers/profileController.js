import User from "../models/User.js";

//create profile
const createProfile = async (req, res) => {
    try {
        //Get profile information from the request body
        const { name, gender, height, weight, age } = req.body;

        //check whether the profile already exists
        if (req.user.profile?.name) {
            return res.status(400).json({
                message: "A profile already exists for this account."
            });
        }

        // Add profile information to the logged-in user 
        req.user.profile = { name, gender, height, weight, age };

        // save the updated user document
        await req.user.save();

        //send successful response
        return res.status(201).json({
            message: "profile created successfully",
            profile: req.user.profile
        });
    }
    catch (error) {
        //handle unexpected errors
        console.error("Create profile error:", error.message);
        return res.status(500).json({
            message: "Unable to create your profile at this time. Please try again later."
        })
    }
};

//get profile
const getProfile = async (req, res) => {
    try {

        //return the profile of the logged in user 
        return res.status(200).json({
            profile: req.user.profile
        });
    } catch (error) {
        console.error("Get profile error :", error.message);
        return res.status(500).json({
            message: "Unable to retreive your profile at this time. Please try again later."
        });
    }
};

// update profile 
const updateProfile = async (req, res) => {
    try {

        //get updated profile information
        const { name, gender, height, weight, age } = req.body;

        //update the profile
        req.user.profile = { name, gender, height, weight, age };

        //save changes
        await req.user.save();

        //send updated profile
        return res.status(200).json({
            message: "profile updated successfully",
            profile: req.user.profile
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        return res.status(500).json({
            message: "Unable to update your profile at this time. Please try again later."
        })
    }
};

export { createProfile, getProfile, updateProfile };