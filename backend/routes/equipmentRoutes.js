import express from "express";
import { addEquipment, editEquipment, deleteEquipment, getAllEquipment } from "../controllers/equipmentController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Equipment ID
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           description: Name of the equipment
 *           example: Laptop
 *         category:
 *           type: string
 *           description: Equipment category
 *           example: Electronics
 *         condition:
 *           type: string
 *           description: Current condition of the equipment
 *           example: Good
 *         totalQuantity:
 *           type: integer
 *           description: Total quantity of equipment
 *           example: 10
 *         availableCount:
 *           type: integer
 *           description: Number of equipment items currently available
 *           example: 7
 */

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Add new equipment
 *     tags: [Equipment]
 *     description: Creates a new equipment item. Available count is automatically set to match total quantity. Only admins can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - condition
 *               - totalQuantity
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the equipment
 *                 example: Laptop
 *               category:
 *                 type: string
 *                 description: Equipment category
 *                 example: Electronics
 *               condition:
 *                 type: string
 *                 description: Current condition of the equipment
 *                 example: Good
 *               totalQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Total quantity of equipment items
 *                 example: 10
 *     responses:
 *       201:
 *         description: Equipment successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
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
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required
 *       500:
 *         description: Server error during equipment creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.post("/", protect, requireRole("admin"), addEquipment);

/**
 * @swagger
 * /equipment/{id}:
 *   put:
 *     summary: Update equipment
 *     tags: [Equipment]
 *     description: Updates an existing equipment item by ID. Only admins can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the equipment
 *                 example: Updated Laptop
 *               category:
 *                 type: string
 *                 description: Equipment category
 *                 example: Electronics
 *               condition:
 *                 type: string
 *                 description: Current condition of the equipment
 *                 example: Excellent
 *               totalQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Total quantity of equipment items
 *                 example: 15
 *               availableCount:
 *                 type: integer
 *                 minimum: 0
 *                 description: Number of equipment items currently available
 *                 example: 12
 *     responses:
 *       200:
 *         description: Equipment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
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
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required
 *       404:
 *         description: Equipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipment not found
 *       500:
 *         description: Server error during equipment update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.put("/:id", protect, requireRole("admin"), editEquipment);

/**
 * @swagger
 * /equipment/{id}:
 *   delete:
 *     summary: Delete equipment
 *     tags: [Equipment]
 *     description: Deletes an equipment item by ID. Only admins can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Equipment successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipment deleted
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
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required
 *       404:
 *         description: Equipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipment not found
 *       500:
 *         description: Server error during equipment deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.delete("/:id", protect, requireRole("admin"), deleteEquipment);

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
 *     tags: [Equipment]
 *     description: Retrieves a list of all equipment items with optional filters. Any authenticated user can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter equipment by category
 *         example: Electronics
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         required: false
 *         description: Filter by availability (true = available items only, false = unavailable items only)
 *         example: true
 *     responses:
 *       200:
 *         description: List of equipment items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 *             examples:
 *               allEquipment:
 *                 summary: All equipment
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Laptop"
 *                     category: "Electronics"
 *                     condition: "Good"
 *                     totalQuantity: 10
 *                     availableCount: 7
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Projector"
 *                     category: "Electronics"
 *                     condition: "Excellent"
 *                     totalQuantity: 5
 *                     availableCount: 5
 *               filteredByCategory:
 *                 summary: Filtered by category
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Laptop"
 *                     category: "Electronics"
 *                     condition: "Good"
 *                     totalQuantity: 10
 *                     availableCount: 7
 *               availableOnly:
 *                 summary: Available equipment only
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Projector"
 *                     category: "Electronics"
 *                     condition: "Excellent"
 *                     totalQuantity: 5
 *                     availableCount: 5
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
 *         description: Server error during equipment retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error: Database connection failed"
 */
router.get("/", protect, getAllEquipment);

export default router;