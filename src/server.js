import dotenv from "dotenv"; // load evironment variables form the .env file
import app from "./app.js"; // import express app from app.js

// load environment variables from the .env file
//after this , we can access values using process.env
dotenv.config();

//Get the PORT value form the .env file
//if PORT is not defined, use 5000 as the default port
const PORT = process.env.PORT || 5000;

//start express server and listen for incoming request
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});