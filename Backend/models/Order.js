
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    payment: {
      provider: {
        type: String,
        default: "razorpay",
      },

      orderId: {
        type: String,
        required: true,
        unique: true,
      },

      paymentId: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "created",
          "paid",
          "failed",
          "refunded",
        ],
        default: "created",
      },
    },

    status: {
      type: String,
      enum: [
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "processing",
    },

    tracking: {
      processingAt: {
        type: Date,
        required: true,
      },

      shippedAt: {
        type: Date,
        required: true,
      },

      deliveredAt: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
