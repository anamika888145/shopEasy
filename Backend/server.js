
import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

import {
  notFound,
  errorHandler,
} from "./Middleware/errorMiddleware.js";

const app = express();

// 1. CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Parse JSON requests
app.use(express.json());

// 3. Serve uploaded product images
app.use("/uploads", express.static("uploads"));

// 4. Basic routes
app.get("/", (req, res) => {
  res.json({ message: "ShopEasy API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
  });
});

// 5. API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/uploads", express.static("uploads"));

// 6. Error handling LAST
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log("Starting ShopEasy Backend...");

  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("MongoDB Connected!");

    app.listen(PORT, () => {
      console.log(`ShopEasy API running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
