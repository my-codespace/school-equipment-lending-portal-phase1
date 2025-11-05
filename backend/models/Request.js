import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "returned"],
        default: "pending"
    },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    returnedAt: { type: Date }

},{ timestamps: true });

export default mongoose.model("Request", requestSchema);