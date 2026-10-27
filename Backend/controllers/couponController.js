
import Coupon from "../models/Coupon.js";

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (new Date(coupon.expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    const orderAmount = Number(subtotal || 0);

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message:
          `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (orderAmount * coupon.discountValue) / 100;

      if (
        coupon.maxDiscount > 0 &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderAmount);

    res.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discount: Number(discount.toFixed(2)),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      finalAmount: Number(
        (orderAmount - discount).toFixed(2)
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      code: req.body.code,
      discountType: req.body.discountType,
      discountValue: Number(req.body.discountValue),
      minOrderAmount: Number(
        req.body.minOrderAmount || 0
      ),
      maxDiscount: Number(
        req.body.maxDiscount || 0
      ),
      expiresAt: req.body.expiresAt,
      usageLimit: Number(
        req.body.usageLimit || 0
      ),
      active:
        req.body.active === undefined
          ? true
          : req.body.active,
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error.code === 11000
          ? "Coupon already exists"
          : error.message,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

