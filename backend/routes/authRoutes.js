import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 * schemas:
 * User:
 * type: object
 * required:
 * - name
 * - email
 * - role
 * properties:
 * _id:
 * type: string
 * description: User's unique identifier (MongoDB ObjectId)
 * example: 507f1f77bcf86cd799439011
 * name:
 * type: string
 * description: Full name of the user
 * example: John Doe
 * email:
 * type: string
 * format: email
 * description: User's email address (must be unique)
 * example: john.doe@example.com
 * role:
 * type: string
 * enum: [student, staff, admin]
 * description: User's role in the system
 * example: student
 * default: student
 * createdAt:
 * type: string
 * format: date-time
 * description: Timestamp when the user was created
 * example: 2025-11-05T09:00:00.000Z
 * updatedAt:
 * type: string
 * format: date-time
 * description: Timestamp when the user was last updated
 * example: 2025-11-05T10:30:00.000Z
 * example:
 * _id: "507f1f77bcf86cd799439011"
 * name: "John Doe"
 * email: "john.doe@example.com"
 * role: "student"
 * createdAt: "2025-11-05T09:00:00.000Z"
 * updatedAt: "2025-11-05T09:00:00.000Z"
 */

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * tags: [Authentication]
 * description: Creates a new user account with the provided credentials. The password will be hashed before storage.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * - role
 * properties:
 * name:
 * type: string
 * description: Full name of the user
 * example: John Doe
 * email:
 * type: string
 * format: email
 * description: User's email address (must be unique)
 * example: john.doe@example.com
 * password:
 * type: string
 * format: password
 * description: User's password (will be hashed)
 * example: securePassword123
 * role:
 * type: string
 * enum: [student, staff, admin]
 * description: User role in the system
 * example: student
 * responses:
 * 201:
 * description: User successfully registered
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Registration successful
 * 400:
 * description: User already exists with this email
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: User already exists
 * 500:
 * description: Server error during registration
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "Error: Database connection failed"
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Login user
 * tags: [Authentication]
 * description: Authenticates a user with email and password, returns a JWT token valid for 2 hours.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * description: User's registered email address
 * example: john.doe@example.com
 * password:
 * type: string
 * format: password
 * description: User's password
 * example: securePassword123
 * responses:
 * 200:
 * description: Login successful, returns JWT token and user information
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token:
 * type: string
 * description: JWT token for authentication (expires in 2 hours)
 * example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * user:
 * type: object
 * properties:
 * name:
 * type: string
 * example: John Doe
 * email:
 * type: string
 * example: john.doe@example.com
 * role:
 * type: string
 * enum: [student, staff, admin]
 * example: student
 * 400:
 * description: Invalid credentials (user not found or incorrect password)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: User not found
 * examples:
 * userNotFound:
 * value:
 * message: User not found
 * incorrectPassword:
 * value:
 * message: Incorrect password
 * 500:
 * description: Server error during login
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "Error: Database connection failed"
 */
router.post("/login", login);

export default router;