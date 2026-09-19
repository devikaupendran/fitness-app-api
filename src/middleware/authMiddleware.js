// Import jsonwebtoken to verify the JWT token
import jwt from "jsonwebtoken";

// Import the User model
import User from "../models/User.js";


// Authentication middleware
const authMiddleware = async (req, res, next) => {

    try {

        // Get the Authorization header from the request
        const authHeader = req.headers.authorization;

        // Check whether the Authorization header exists
        if (!authHeader) {

            return res.status(401).json({
                message: "Authentication token is required. Please login to continue"
            });

        }

        // Check whether the header starts with "Bearer "
        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                message: "Invalid authentication credentials."
            });

        }

        // Extract the token from:
        // "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify the JWT token using our secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find the user using the userId stored inside the token
        const user = await User.findById(decoded.userId);

        // Check whether the user still exists
        if (!user) {

            return res.status(401).json({
                message: "THe account assosiated with this session could not be found"
            });

        }

        // Attach the logged-in user to the request object
        // Controllers can access the user using req.user
        req.user = user;

        // Continue to the next middleware/controller
        next();

    } catch (error) {

        // Handle invalid or expired JWT tokens
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            message: "Your session is invalid or has expired. Please login again"
        });

    }
};


// Export authentication middleware
export default authMiddleware;