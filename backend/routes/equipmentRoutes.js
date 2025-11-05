import express from "express";
import { addEquipment, editEquipment, deleteEquipment, getAllEquipment } from "../controllers/equipmentController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admins can add, edit, or delete equipment
router.post("/", protect, requireRole("admin"), addEquipment);
router.put("/:id", protect, requireRole("admin"), editEquipment);
router.delete("/:id", protect, requireRole("admin"), deleteEquipment);

// Any logged-in user can view the list
router.get("/", protect, getAllEquipment);

export default router;
