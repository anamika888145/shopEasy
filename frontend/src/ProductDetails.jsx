
import { useEffect, useState } from "react";

function ProductDetails({
  product,
  isInWishlist,
  onWishlist,
  onAddToCart,
  onOrderNow,
  onBack,
}) {
  const [selectedSize, setSelectedSize] =
    useState("");

  const [reviewText, setReviewText] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviews, setReviews] = useState([]);

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ];

  const isFashionProduct =
    product.category
      ?.toLowerCase()
      .includes("women") ||
    product.category
      ?.toLowerCase()
      .includes("fashion") ||
    product.category
      ?.toLowerCase()
      .includes("clothing");

  const reviewKey = `shopeasy_reviews_${product._id}`;

  const discount =
    product.oldPrice &&
    Number(product.oldPrice) >
      Number(product.price)
      ? Math.round(
          ((Number(product.oldPrice) -
            Number(product.price)) /
            Number(product.oldPrice)) *
            100
        )
      : 0;

  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  useEffect(() => {
    try {
      const savedReviews =
        JSON.parse(
          localStorage.getItem(
            reviewKey
          )
        ) || [];

      setReviews(savedReviews);
    } catch {
      setReviews([]);
    }
  }, [reviewKey]);

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      alert("Please review likhein.");
      return;
    }

    const user =
      JSON.parse(
        localStorage.getItem("user") ||
          "{}"
      );

    const newReview = {
      id: Date.now(),
      name:
        user.name || "ShopEasy Customer",
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString(),
    };

    const updatedReviews = [
      newReview,
      ...reviews,
    ];

    setReviews(updatedReviews);

    localStorage.setItem(
      reviewKey,
      JSON.stringify(
        updatedReviews
      )
    );

    setReviewText("");
    setReviewRating(5);

    alert(
      "Review successfully add ho gaya!"
    );
  };

  // ==========================================
  // ADD CART
  // ==========================================

  const handleCart = () => {
    if (
      isFashionProduct &&
      !selectedSize
    ) {
      alert(
        "Please apna size select karein."
      );
      return;
    }

    onAddToCart({
      ...product,
      selectedSize:
        selectedSize || null,
    });
  };

  // ==========================================
  // BUY NOW
  // ==========================================

  const handleBuyNow = () => {
    if (
      isFashionProduct &&
      !selectedSize
    ) {
      alert(
        "Please apna size select karein."
      );
      return;
    }

    onOrderNow({
      ...product,
      selectedSize:
        selectedSize || null,
    });
  };

  return (
    <div className="product-detail-page">

      <div className="product-detail-container">

        {/* BACK */}

        <button
          type="button"
          className="back-order-btn"
          onClick={onBack}
        >
          ← Back to Store
        </button>

        {/* ====================================
            MAIN PRODUCT
        ==================================== */}

        <div className="product-detail-layout">

          {/* IMAGE */}

          <div className="detail-image-card">

            {product.image ? (
             <img
  src={
    product.image?.startsWith("http")
      ? product.image
      : `http://localhost:5000${product.image?.startsWith("/") ? "" : "/"}${product.image || ""}`
  }
  alt={product.name}
/>
            ) : (
              <div className="detail-image-placeholder">
                🛍️
              </div>
            )}

            {discount > 0 && (
              <span className="detail-sale-badge">
                {discount}% OFF
              </span>
            )}

          </div>

          {/* INFO */}

          <div className="detail-info">

            <span className="eyebrow">
              {product.category ||
                "SHOP EASY COLLECTION"}
            </span>

            <div className="detail-title-row">

              <h1>
                {product.name}
              </h1>

              <button
                type="button"
                className={`detail-wishlist ${
                  isInWishlist
                    ? "wish-active"
                    : ""
                }`}
                onClick={
                  onWishlist
                }
              >
                {isInWishlist
                  ? "♥"
                  : "♡"}
              </button>

            </div>

            {/* RATING */}

            <div className="detail-rating">
              ⭐{" "}
              {Number(
                product.rating || 0
              ).toFixed(1)}

              <span>
                Premium Collection
              </span>
            </div>

            {/* DESCRIPTION */}

            <p className="detail-description">
              {product.description ||
                "Premium quality product from ShopEasy."}
            </p>

            {/* PRICE */}

            <div className="detail-price-box">

              <span className="detail-current-price">
                ₹
                {Number(
                  product.price || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

              {product.oldPrice &&
                Number(
                  product.oldPrice
                ) >
                  Number(
                    product.price
                  ) && (
                  <span className="detail-old-price">
                    ₹
                    {Number(
                      product.oldPrice
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}

              {discount > 0 && (
                <span className="detail-discount">
                  Save {discount}%
                </span>
              )}

            </div>

            {/* STOCK */}

            <div className="detail-stock">

              {Number(
                product.stock || 0
              ) > 0 ? (
                <>
                  ✓ In Stock

                  <span>
                    {product.stock} units
                    available
                  </span>
                </>
              ) : (
                <>
                  Out of Stock
                </>
              )}

            </div>

            {/* =================================
                SIZE SELECTOR
            ================================= */}

            {isFashionProduct && (
              <div className="size-selector">

                <div className="size-header">

                  <strong>
                    Select Size
                  </strong>

                  <span>
                    Size Guide
                  </span>

                </div>

                <div className="size-grid">

                  {sizes.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        className={
                          selectedSize ===
                          size
                            ? "size-btn active"
                            : "size-btn"
                        }
                        onClick={() =>
                          setSelectedSize(
                            size
                          )
                        }
                      >
                        {size}
                      </button>
                    )
                  )}

                </div>

                {selectedSize && (
                  <div className="selected-size">
                    Selected size:{" "}
                    <strong>
                      {selectedSize}
                    </strong>
                  </div>
                )}

              </div>
            )}

            {/* BUTTONS */}

            <div className="detail-action-row">

              <button
                type="button"
                className="detail-cart-btn"
                disabled={
                  Number(
                    product.stock || 0
                  ) <= 0
                }
                onClick={
                  handleCart
                }
              >
                🛒 Add to Cart
              </button>

              <button
                type="button"
                className="detail-buy-btn"
                disabled={
                  Number(
                    product.stock || 0
                  ) <= 0
                }
                onClick={
                  handleBuyNow
                }
              >
                Buy Now →
              </button>

            </div>

            {/* BENEFITS */}

            <div className="detail-benefits">

              <div>
                🚚

                <strong>
                  Fast Delivery
                </strong>

                <span>
                  Reliable delivery
                </span>
              </div>

              <div>
                🔒

                <strong>
                  Secure Payment
                </strong>

                <span>
                  Safe checkout
                </span>
              </div>

              <div>
                💎

                <strong>
                  Premium Quality
                </strong>

                <span>
                  ShopEasy collection
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* ====================================
            REVIEWS
        ==================================== */}

        <section className="reviews-section">

          <div className="reviews-heading">

            <div>
              <span className="eyebrow">
                CUSTOMER LOVE
              </span>

              <h2>
                Reviews & Ratings
              </h2>

              <p>
                Real feedback from ShopEasy
                customers.
              </p>
            </div>

            <div className="review-score">

              <strong>
                ⭐{" "}
                {Number(
                  product.rating || 0
                ).toFixed(1)}
              </strong>

              <span>
                Product Rating
              </span>

            </div>

          </div>

          <div className="reviews-layout">

            {/* REVIEW FORM */}

            <div className="review-form-card">

              <span className="review-form-label">
                SHARE YOUR EXPERIENCE
              </span>

              <h3>
                Write a Review
              </h3>

              <form
                onSubmit={
                  handleReviewSubmit
                }
              >

                <div className="review-stars-input">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewRating(
                            star
                          )
                        }
                        className={
                          star <=
                          reviewRating
                            ? "star active"
                            : "star"
                        }
                      >
                        ★
                      </button>
                    )
                  )}

                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(
                      e.target.value
                    )
                  }
                  rows="5"
                  placeholder="Tell us about the product..."
                />

                <button
                  type="submit"
                  className="submit-review-btn"
                >
                  Submit Review →
                </button>

              </form>

            </div>

            {/* REVIEWS LIST */}

            <div className="reviews-list">

              {reviews.length === 0 ? (
                <div className="no-reviews">

                  <div>
                    ⭐
                  </div>

                  <h3>
                    Be the first to review
                  </h3>

                  <p>
                    Your experience can help
                    other shoppers.
                  </p>

                </div>
              ) : (
                reviews.map(
                  (review) => (
                    <article
                      className="review-card"
                      key={review.id}
                    >

                      <div className="review-top">

                        <div className="review-user">

                          <div className="review-avatar">
                            {review.name
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {review.name}
                            </strong>

                            <small>
                              {new Date(
                                review.date
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </small>
                          </div>

                        </div>

                        <div className="review-rating">
                          {"★".repeat(
                            review.rating
                          )}

                          <span>
                            {"☆".repeat(
                              5 -
                                review.rating
                            )}
                          </span>
                        </div>

                      </div>

                      <p className="review-text">
                        “{review.text}”
                      </p>

                    </article>
                  )
                )
              )}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default ProductDetails;
