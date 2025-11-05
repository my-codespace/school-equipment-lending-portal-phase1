import express from "express";
import { createRequest, approveRequest, rejectRequest, returnEquipment, listRequests } from "../controllers/requestController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in users can create a borrow request
router.post("/", protect, requireRole("student"), createRequest);

// Only staff/admin can approve, reject or mark return
router.patch("/:id/approve", protect, requireRole("admin", "staff"), approveRequest);
router.patch("/:id/reject", protect, requireRole("admin", "staff"), rejectRequest);
router.patch("/:id/return", protect, requireRole("admin", "staff"), returnEquipment);

// Any logged-in user can view requests (optional: restrict to admin/staff)
router.get("/", protect, listRequests);

export default router;
