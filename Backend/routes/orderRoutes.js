
import express from "express";

import {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import protect from "../Middleware/authMiddleware.js";
import adminOnly from "../Middleware/adminMiddleware.js";

const router = express.Router();

// Customer
router.get("/my", protect, getMyOrders);

// Admin
router.get(
  "/",
  protect,
  adminOnly,
  getAllOrders
);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

export default router;
