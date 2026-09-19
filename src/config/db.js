import mongoose from "mongoose";
//mongoose help us connect and work with mongoDB in our nodejs app

//create an asynchronous function  to connect to mongodb
const connectDB = async () => {
    try {
        //connect to mongodb using the connection string
        //process.env.MONGODB_URI gets the MONGODB URL from the .env file
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongodb connected successfully');
    }
    catch (error) {

        //display the error message if the mongodb connection fail
        console.log("Mongodb connection failed:", error.message);
        process.exit(1); //stop and exit 
    }
};
// Export the connectDB function
// we can import and call this function from server.js
export default connectDB;