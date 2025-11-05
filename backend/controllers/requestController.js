import Request from "../models/Request.js";
import Equipment from "../models/Equipment.js";

// Student creates a borrow request
export const createRequest = async (req, res) => {
    try {
        const { equipmentId } = req.body;
        const userId = req.user.userId;

        // Check if equipment is available
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment || equipment.availableCount <= 0) {
            return res.status(400).json({ message: "Equipment not available" });
        }

        // Prevent duplicate active request by this user
        const activeRequest = await Request.findOne({
            user: userId,
            equipment: equipmentId,
            status: { $in: ["pending", "approved"] }
        });
        if (activeRequest) {
            return res.status(409).json({ message: "Active request already exists for this equipment" });
        }

        const request = await Request.create({ user: userId, equipment: equipmentId });
        // Populate related objects for frontend consumption
        const populatedRequest = await Request.findById(request._id)
            .populate("user", "name email")
            .populate("equipment", "name category");

        res.status(201).json(populatedRequest);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// Admin/staff approves a request
export const approveRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await Request.findById(requestId).populate("equipment");
        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Request not found or already processed" });
        }
        const equipment = await Equipment.findById(request.equipment._id);
        if (equipment.availableCount <= 0)
            return res.status(400).json({ message: "Equipment unavailable" });
        equipment.availableCount -= 1;
        await equipment.save();

        request.status = "approved";
        request.approvedAt = new Date();   // <-- Explicitly set approvedAt
        await request.save();

        const populatedRequest = await Request.findById(request._id)
            .populate("user", "name email")
            .populate("equipment", "name category");

        res.json(populatedRequest); // Return the full request object
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// Admin/staff rejects a request
export const rejectRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await Request.findById(requestId);
        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Request not found or already processed" });
        }
        request.status = "rejected";
        request.rejectedAt = new Date();   // <-- Explicitly set rejectedAt
        await request.save();

        const populatedRequest = await Request.findById(request._id)
            .populate("user", "name email")
            .populate("equipment", "name category");

        res.json(populatedRequest);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// Admin marks as returned
export const returnEquipment = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await Request.findById(requestId).populate("equipment");
        if (!request || request.status !== "approved") {
            return res.status(404).json({ message: "Request not found or not approved" });
        }
        // Increment availableCount
        const equipment = await Equipment.findById(request.equipment._id);
        equipment.availableCount += 1;
        await equipment.save();

        request.status = "returned";
        request.returnedAt = new Date();  // <-- Explicitly set returnedAt
        await request.save();

        const populatedRequest = await Request.findById(request._id)
            .populate("user", "name email")
            .populate("equipment", "name category");

        res.json(populatedRequest);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

export const listRequests = async (req, res) => {
    try {
        const query = {};
        const { userId, role } = req.user;

        if (role === "student") {
            query.user = userId;
        }
        else if (req.query.user) {
            query.user = req.query.user;
        }
        if (req.query.status) query.status = req.query.status;

        const requests = await Request.find(query)
            .populate("equipment", "name category")
            .populate("user", "name email");

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};