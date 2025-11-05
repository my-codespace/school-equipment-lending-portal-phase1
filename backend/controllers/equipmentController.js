import Equipment from "../models/Equipment.js";

// Add Equipment
export const addEquipment = async (req, res) => {
    try {
        const { name, category, condition, totalQuantity } = req.body;
        const equipment = await Equipment.create({
            name, category, condition,
            totalQuantity,
            availableCount: totalQuantity,
        });
        res.status(201).json(equipment);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// Edit Equipment
export const editEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// Delete Equipment
export const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        await Equipment.findByIdAndDelete(id);
        res.json({ message: "Equipment deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// List/Filter Equipments
export const getAllEquipment = async (req, res) => {
    try {
        const { category, available } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        if (available === 'true') {
            filter.availableCount = { $gt: 0 };
        } else if (available === 'false') {
            filter.availableCount = 0;
        }

        const equipment = await Equipment.find(filter);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


