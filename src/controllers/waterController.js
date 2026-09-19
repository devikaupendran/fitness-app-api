// Controller to calculate the user's daily water goal
const getWaterGoal = async (req, res) => {

    try {

        // Get the logged-in user's profile
        // authMiddleware has already added the user to req.user
        const user = req.user;

        // Get the user's weight from the profile
        const weight = user.profile?.weight;

        // Check whether weight is available
        if (!weight) {

            return res.status(400).json({
                message: "Please update your weight in your profile"
            });

        }

        // Calculate daily water goal
        // Formula:
        // Weight (kg) × 35 ml
        const waterGoal = weight * 35;

        // Convert millilitres to litres
        const waterGoalInLitres = waterGoal / 1000;

        // Send the calculated water goal
        return res.status(200).json({

            message: "Water goal calculated successfully",

            waterGoal: {
                ml: waterGoal,
                litres: Number(waterGoalInLitres.toFixed(2))
            }

        });

    } catch (error) {

        // Handle unexpected errors
        console.error("Water goal calculation error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });

    }
};


// Export the controller
export default getWaterGoal;