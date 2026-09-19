// Controller to calculate the user's daily water goal
const getWaterGoal = async (req, res) => {

    try {

        // Get the logged-in user's profile
        // authMiddleware has already added the user to req.user
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

        // Calculate water requirement based on gender
        let waterPerKg;

        if (gender === "male") {

            // Male: 35 ml per kg
            waterPerKg = 35;

        } else if (gender === "female") {

            // Female: 33 ml per kg
            waterPerKg = 33;

        } else {

            return res.status(400).json({
                message: "Invalid gender in profile"
            });

        }

        // Calculate daily water goal
        // Formula:
        // Weight × water requirement per kg
        const waterGoal = weight * waterPerKg;

        // Convert millilitres to litres
        const waterGoalInLitres = waterGoal / 1000;

        // Send the calculated water goal
        return res.status(200).json({

            message: "Daily water goal calculated successfully",

            waterGoal: {
                ml: waterGoal,
                litres: Number(waterGoalInLitres.toFixed(2))
            }

        });

    } catch (error) {

        // Handle unexpected errors
        console.error(
            "Water goal calculation error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to calculate water goal"
        });

    }
};


// Export the controller
export default getWaterGoal;