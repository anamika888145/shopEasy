import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import protect from "../Middleware/authMiddleware.js";
import adminOnly from "../Middleware/adminMiddleware.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProduct);

// Create product with image upload
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createProduct
);

// Update product with optional new image
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

export default router;