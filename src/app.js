import express from 'express';

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

// Export the Express app
// This allows us to use the app in other files, such as server.js
export default app;
