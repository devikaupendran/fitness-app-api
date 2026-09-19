import express from 'express';
import authRoutes from './routes/authRoutes.js'
import profileRoutes from "./routes/profileRoutes.js"
import waterRoutes from "./routes/waterRoutes.js";

//create an express application
const app = express();

// middleware to parse incoming JSON request bodies 
// This allows us to access JSON data using req.body
app.use(express.json());

//Root url 
//used to check whether the API is running
app.get("/", (req,res) => {
    res.json({
        message: "Fitness API is running"
    });
});

//Authentication routes
//All auth APIs will start with /api/auth
app.use("/api/auth", authRoutes)

//profile routes
app.use("/api/profile", profileRoutes);

// Water-related routes
app.use("/api/water", waterRoutes);

// Export the Express app
// This allows us to use the app in other files, such as server.js
export default app;
