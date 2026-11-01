import Razorpay from "razorpay";
import crypto from "crypto";

import Product from "../models/Product.js";
import Order from "../models/Order.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================


export const createPaymentOrder = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const qty = Number(quantity);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    console.log("PAYMENT PRODUCT ID:", productId);

    // Find product first
    const product = await Product.findById(productId);

    console.log("FOUND PRODUCT:", product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (Number(product.stock) < qty) {
      return res.status(400).json({
        success: false,
        message: "Product stock is not available",
      });
    }

    const totalAmount = Number(product.price) * qty;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: String(product._id),
        userId: String(req.user._id),
        quantity: String(qty),
      },
    });

    return res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || "",
      },
      quantity: qty,
      totalAmount,
    });

  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create payment order",
    });
  }
};


// ==========================================
// VERIFY PAYMENT + CREATE ORDER
// ==========================================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      productId,
      quantity = 1,

      shippingAddress,
    } = req.body;

    // ======================================
    // BASIC VALIDATION
    // ======================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // ======================================
    // VERIFY RAZORPAY SIGNATURE
    // ======================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ======================================
    // PREVENT DUPLICATE ORDER
    // ======================================

    const existingOrder =
      await Order.findOne({
        "payment.orderId":
          razorpay_order_id,
      });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already saved",
        order: existingOrder,
      });
    }

    // ======================================
    // GET PRODUCT FROM DATABASE
    // ======================================

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ======================================
    // CHECK STOCK
    // ======================================

    if (Number(product.stock) < qty) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // ======================================
    // CALCULATE FINAL TOTAL
    // ======================================

    const totalAmount =
      Number(product.price) * qty;

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount",
      });
    }

    // ======================================
    // DELIVERY DATES
    //
    // Order Date     = Processing
    // + 2 Days       = Shipped
    // + 5 Days       = Delivered
    // ======================================

    const processingAt = new Date();

    const shippedAt = new Date(
      processingAt.getTime() +
        2 * 24 * 60 * 60 * 1000
    );

    const deliveredAt = new Date(
      processingAt.getTime() +
        5 * 24 * 60 * 60 * 1000
    );

    // ======================================
    // CREATE ORDER
    // ======================================

    const order = await Order.create({
      user: req.user._id,

      items: [
        {
          product: product._id,
          name: product.name,
          price: Number(product.price),
          quantity: qty,
          image: product.image || "",
        },
      ],

      totalAmount,

      shippingAddress: {
        fullName:
          shippingAddress.fullName,

        phone:
          shippingAddress.phone,

        address:
          shippingAddress.address,

        city:
          shippingAddress.city,

        state:
          shippingAddress.state,

        pincode:
          shippingAddress.pincode,
      },

      payment: {
        provider: "razorpay",

        orderId:
          razorpay_order_id,

        paymentId:
          razorpay_payment_id,

        status: "paid",
      },

      status: "processing",

      tracking: {
        processingAt,
        shippedAt,
        deliveredAt,
      },
    });

    // ======================================
    // REDUCE PRODUCT STOCK
    // ======================================

    product.stock =
      Number(product.stock) - qty;

    await product.save();

    // ======================================
    // SUCCESS RESPONSE
    // ======================================

    res.status(200).json({
      success: true,

      message:
        "Payment verified and order placed successfully",

      paymentId:
        razorpay_payment_id,

      razorpayOrderId:
        razorpay_order_id,

      tracking: {
        processingAt,
        shippedAt,
        deliveredAt,
      },

      order,
    });
  } catch (error) {
    console.error(
      "PAYMENT VERIFY ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Payment verification failed",
    });
  }
};
