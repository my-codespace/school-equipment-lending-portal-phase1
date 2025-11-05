import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    condition: { type: String, default: "good" },
    totalQuantity: { type: Number, required: true },
    availableCount: { type: Number, required: true },
});

export default mongoose.model("Equipment", equipmentSchema);
