
import Order from "../models/Order.js";


// =====================================
// AUTOMATIC STATUS
// =====================================

const calculateStatus = (order) => {
  if (order.status === "cancelled") {
    return "cancelled";
  }

  const now = new Date();

  const shippedAt = order.tracking?.shippedAt
    ? new Date(order.tracking.shippedAt)
    : null;

  const deliveredAt = order.tracking?.deliveredAt
    ? new Date(order.tracking.deliveredAt)
    : null;

  if (
    deliveredAt &&
    now >= deliveredAt
  ) {
    return "delivered";
  }

  if (
    shippedAt &&
    now >= shippedAt
  ) {
    return "shipped";
  }

  return "processing";
};


// =====================================
// CUSTOMER - MY ORDERS
// =====================================

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate(
        "items.product",
        "name image price"
      )
      .sort({ createdAt: -1 });

    const result = orders.map((order) => {
      const orderData = order.toObject();

      orderData.status =
        calculateStatus(orderData);

      return orderData;
    });

    res.json({
      success: true,
      orders: result,
    });
  } catch (error) {
    console.error(
      "GET MY ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Orders load nahi ho rahe.",
    });
  }
};


// =====================================
// ADMIN - ALL ORDERS
// =====================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .populate(
        "items.product",
        "name image price"
      )
      .sort({ createdAt: -1 });

    const result = orders.map((order) => {
      const orderData = order.toObject();

      orderData.status =
        calculateStatus(orderData);

      return orderData;
    });

    res.json({
      success: true,
      orders: result,
    });
  } catch (error) {
    console.error(
      "GET ALL ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "All orders load nahi ho rahe.",
    });
  }
};


// =====================================
// ADMIN - CANCEL ORDER
// =====================================

export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Processing, Shipped aur Delivered status date ke according automatic hain.",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.status = "cancelled";

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled.",
      order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Order status update failed.",
    });
  }
};