
import React from "react";

const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

function Wishlist({
  wishlist,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onOrderNow,
  onViewProduct,
}) {
  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <button
          type="button"
          className="back-order-btn"
          onClick={onBack}
        >
          ← Back to Store
        </button>

        <div className="wishlist-header">
          <div>
            <span className="eyebrow">SHOPEASY</span>
            <h1>My Wishlist</h1>
            <p>
              Apne favourite premium products yahan save karein.
            </p>
          </div>

          <div className="wishlist-count">
            {wishlist.length} Saved
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-icon">♡</div>

            <h2>Your wishlist is empty</h2>

            <p>
              Product ke heart button par click karke
              favourite save karein.
            </p>

            <button
              type="button"
              className="hero-primary"
              onClick={onBack}
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <article
                className="wishlist-card"
                key={product._id}
              >
                <div
                  className="wishlist-image"
                  onClick={() => onViewProduct(product)}
                >
                  {product.image ? (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name || "ShopEasy Product"}
                      onError={(e) => {
                        console.error(
                          "Wishlist image error:",
                          getImageUrl(product.image)
                        );

                        e.currentTarget.src =
                          "https://placehold.co/600x500?text=ShopEasy";
                      }}
                    />
                  ) : (
                    <span>🛍️</span>
                  )}

                  <button
                    type="button"
                    className="wishlist-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                  >
                    ♥
                  </button>
                </div>

                <div className="wishlist-content">
                  <span className="product-category">
                    {product.category || "Premium"}
                  </span>

                  <h3 onClick={() => onViewProduct(product)}>
                    {product.name}
                  </h3>

                  <p className="wishlist-description">
                    {product.description ||
                      "Premium quality product from ShopEasy."}
                  </p>

                  <div className="wishlist-price">
                    ₹
                    {Number(product.price || 0).toLocaleString("en-IN")}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() => onAddToCart(product)}
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      className="order-btn"
                      onClick={() => onOrderNow(product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
