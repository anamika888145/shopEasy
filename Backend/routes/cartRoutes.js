import express from "express";

import protect from "../Middleware/authMiddleware.js";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);

router.post("/", addToCart);

router.put("/:productId", updateCartItem);

router.delete("/:productId", removeFromCart);

export default router;