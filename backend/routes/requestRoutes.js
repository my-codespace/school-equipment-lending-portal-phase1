import express from "express";
import { createRequest, approveRequest, rejectRequest, returnEquipment, listRequests } from "../controllers/requestController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Request ID
 *           example: 507f1f77bcf86cd799439011
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 507f1f77bcf86cd799439012
 *             name:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               example: john.doe@example.com
 *         equipment:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 507f1f77bcf86cd799439013
 *             name:
 *               type: string
 *               example: Laptop
 *             category:
 *               type: string
 *               example: Electronics
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, returned]
 *           description: Current status of the request
 *           example: pending
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when request was approved
 *           example: 2025-11-05T10:30:00.000Z
 *         rejectedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when request was rejected
 *           example: 2025-11-05T10:30:00.000Z
 *         returnedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when equipment was returned
 *           example: 2025-11-05T10:30:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when request was created
 *           example: 2025-11-05T09:00:00.000Z
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a borrow request
 *     tags: [Requests]
 *     description: Creates a new borrow request for equipment. Students can only create requests for available equipment and cannot have duplicate active requests (pending or approved) for the same equipment. Only students can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipmentId
 *             properties:
 *               equipmentId:
 *                 type: string
 *                 description: ID of the equipment to borrow (MongoDB ObjectId)
 *                 example: 507f1f77bcf86cd799439013
 *     responses:
 *       201:
 *         description: Request successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         description: Equipment not available (no stock or equipment doesn't exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipment not available
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, token missing or invalid
 *       403:
 *         description: Forbidden - User does not have student role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Student role required
 *       409:
 *         description: Conflict - User already has an active request for this equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Active request already exists for this equipment
 *       500:
 *         description: Server error during request creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.post("/", protect, requireRole("student"), createRequest);

/**
 * @swagger
 * /requests/{id}/approve:
 *   patch:
 *     summary: Approve a borrow request
 *     tags: [Requests]
 *     description: Approves a pending borrow request and decrements the equipment's available count. Only requests with status "pending" can be approved. Only admin and staff can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         description: Equipment unavailable (no stock left)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipment unavailable
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, token missing or invalid
 *       403:
 *         description: Forbidden - User does not have admin or staff role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin or Staff role required
 *       404:
 *         description: Request not found or already processed (not in pending status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request not found or already processed
 *       500:
 *         description: Server error during request approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.patch("/:id/approve", protect, requireRole("admin", "staff"), approveRequest);

/**
 * @swagger
 * /requests/{id}/reject:
 *   patch:
 *     summary: Reject a borrow request
 *     tags: [Requests]
 *     description: Rejects a pending borrow request. Only requests with status "pending" can be rejected. Equipment availability is not affected. Only admin and staff can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request successfully rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, token missing or invalid
 *       403:
 *         description: Forbidden - User does not have admin or staff role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin or Staff role required
 *       404:
 *         description: Request not found or already processed (not in pending status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request not found or already processed
 *       500:
 *         description: Server error during request rejection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.patch("/:id/reject", protect, requireRole("admin", "staff"), rejectRequest);

/**
 * @swagger
 * /requests/{id}/return:
 *   patch:
 *     summary: Mark equipment as returned
 *     tags: [Requests]
 *     description: Marks equipment as returned and increments the equipment's available count. Only requests with status "approved" can be marked as returned. Only admin and staff can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Equipment successfully marked as returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, token missing or invalid
 *       403:
 *         description: Forbidden - User does not have admin or staff role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin or Staff role required
 *       404:
 *         description: Request not found or not approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request not found or not approved
 *       500:
 *         description: Server error during return processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.patch("/:id/return", protect, requireRole("admin", "staff"), returnEquipment);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     description: Retrieves a list of borrow requests. Students see only their own requests. Admin and staff can see all requests and filter by user ID and status. Any authenticated user can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by user ID (Admin/Staff only, students always see their own requests regardless of this parameter)
 *         example: 507f1f77bcf86cd799439012
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, returned]
 *         required: false
 *         description: Filter requests by status
 *         example: pending
 *     responses:
 *       200:
 *         description: List of requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *             examples:
 *               allRequests:
 *                 summary: All requests (Admin/Staff view)
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     user:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       name: "John Doe"
 *                       email: "john.doe@example.com"
 *                     equipment:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       name: "Laptop"
 *                       category: "Electronics"
 *                     status: "pending"
 *                     createdAt: "2025-11-05T09:00:00.000Z"
 *                   - _id: "507f1f77bcf86cd799439014"
 *                     user:
 *                       _id: "507f1f77bcf86cd799439015"
 *                       name: "Jane Smith"
 *                       email: "jane.smith@example.com"
 *                     equipment:
 *                       _id: "507f1f77bcf86cd799439016"
 *                       name: "Projector"
 *                       category: "Electronics"
 *                     status: "approved"
 *                     approvedAt: "2025-11-05T10:30:00.000Z"
 *                     createdAt: "2025-11-05T09:15:00.000Z"
 *               studentRequests:
 *                 summary: Student's own requests
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     user:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       name: "John Doe"
 *                       email: "john.doe@example.com"
 *                     equipment:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       name: "Laptop"
 *                       category: "Electronics"
 *                     status: "pending"
 *                     createdAt: "2025-11-05T09:00:00.000Z"
 *               filteredByStatus:
 *                 summary: Filtered by status (pending only)
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     user:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       name: "John Doe"
 *                       email: "john.doe@example.com"
 *                     equipment:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       name: "Laptop"
 *                       category: "Electronics"
 *                     status: "pending"
 *                     createdAt: "2025-11-05T09:00:00.000Z"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, token missing or invalid
 *       500:
 *         description: Server error during request retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.get("/", protect, listRequests);

export default router;