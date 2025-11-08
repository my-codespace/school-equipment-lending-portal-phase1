import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';

// Create the express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
// Note: Your original server.js had "/api/request", this should match your routes file.
// I'll assume it's "/api/request"
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/request", requestRoutes); 

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test/Home Route
app.get("/", (req, res) => {
    res.send("School Equipment Lending Portal Backend Running");
});

export default app;