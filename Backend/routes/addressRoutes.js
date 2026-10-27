import express from "express";

import {
  getMyAddresses,
  createAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyAddresses);
router.post("/", protect, createAddress);
router.delete("/:id", protect, deleteAddress);

export default router;