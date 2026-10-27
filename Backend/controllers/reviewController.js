

import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message:
          "Product, rating and comment are required",
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    const allReviews = await Review.find({
      product: productId,
    });

    const average =
      allReviews.reduce(
        (sum, item) => sum + item.rating,
        0
      ) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(average.toFixed(1)),
    });

    const populatedReview = await Review.findById(
      review._id
    ).populate("user", "name");

    res.status(201).json({
      success: true,
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      String(review.user) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    const allReviews = await Review.find({
      product: productId,
    });

    const average = allReviews.length
      ? allReviews.reduce(
          (sum, item) => sum + item.rating,
          0
        ) / allReviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(average.toFixed(1)),
    });

    res.json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

