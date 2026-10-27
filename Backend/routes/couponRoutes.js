
import express from "express";

import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

import protect from "../Middleware/authMiddleware.js";
import adminOnly from "../Middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/validate",
  protect,
  validateCoupon
);

router.get(
  "/admin",
  protect,
  adminOnly,
  getCoupons
);

router.post(
  "/admin",
  protect,
  adminOnly,
  createCoupon
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteCoupon
);

export default router;