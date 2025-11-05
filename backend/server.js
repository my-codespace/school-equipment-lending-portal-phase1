import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";

dotenv.config({ path: './.env' });
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/request", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);


app.get("/", (req, res) => {
    res.send("School Equipment Lending Portal Backend Running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
