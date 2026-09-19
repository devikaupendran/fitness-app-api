//import bcrypt for password hashing
import bcrypt from "bcryptjs";

//create authentication tokens
import jwt from "jsonwebtoken"

//import the user model 
import User from "../models/User.js";

//signup controller
const signup = async (req, res) => {
    try {
        //get username, email and password from the request body
        const {username, email, password, confirmPassword} = req.body;

        //check whether all required fields are provided
        if(!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        // check whether password and confirm password are the same 
        if(password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match. Please try again."
            });
        }

        //check whether the username already exists
        const existingUsername = await User.findOne({username});

        if(existingUsername) {
            return res.status(409).json({
                message: "This username is already in use. Please choose another one."
            })
        }

        //check whether the email already exists
        const existingEmail = await User.findOne({email});

        if(existingEmail) {
            return res.status(409).json({
                message: "An account with this email address already exists."
            });
        }

        //Hash the password before storing it in MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Send successful response
        return res.status(201).json({
            message: "Your account has been created successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {

        // handle unexpected errors
        console.error("signup error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while creating your account. Please try again later."
        });
    }
};


//Login COntroller
const login = async (req, res) => {
    try {
        // get username and password from the request body
        const {username, password} = req.body;

        // check whether username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                message: "Please provide your username and password."
            });
        }

        // find the user using the username
        const user = await User.findOne({username});

        //check whether the user exists
        if(!user) {
            return res.status(401).json ({
                message: "invalid username or password"
            });
        }

        // compare the entered password with the hashed password
        //stored in MongoDB
        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        //check whether the password is correct
        if(!isPasswordMatch) {
            return res.status(401).json({
                message:"invalid username or password"
            })
        }

        //create a JWT token for the authenticated user
        const token = jwt.sign(
            //data stored inside the token
            {
                userId: user._id
            },

            //secret key used to sign the token
            process.env.JWT_SECRET,

            //token expiration time
            {
                expiresIn: "7d"
            }
        );

         // Send successful login response
        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        //handle unexpected server error
        console.log("Login error:", error.message);

       return res.status(500).json({
            message: "Something went wrong while logging you in. Please try again later."
        });
    }
}


// Export authentication controllers
export {
    signup,
    login
};