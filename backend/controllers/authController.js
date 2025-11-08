import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * @param {object} req - Express request object, containing body with { name, email, password, role }
 * @param {object} res - Express response object
 * @returns {object} JSON response with a success message or error
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user in the database
        const user = await User.create({ name, email, password: hashedPassword, role });
        
        // Send a success response
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: "Error: " + err.message });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and return a JWT token
 * @access  Public
 *
 * @param {object} req - Express request object, containing body with { email, password }
 * @param {object} res - Express response object
 * @returns {object} JSON response with JWT token and user info, or an error
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        // Create JWT payload
        const payload = {
            userId: user._id,
            role: user.role
        };
        
        // Sign the token
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" } // Token expires in 2 hours
        );

        // Send token and user info (excluding password)
        res.json({ 
            token, 
            user: { 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: "Error: " + err.message });
    }
};