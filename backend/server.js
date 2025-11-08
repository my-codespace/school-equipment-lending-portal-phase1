import app from './app.js'; // Import the new app
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Load env vars
dotenv.config({ path: './.env' });

// Connect to Database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});