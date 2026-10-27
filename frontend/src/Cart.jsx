
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

function Cart({
  cart,
  onBack,
  onUpdateQuantity,
  onRemove,
  onClear,
  onViewProduct,
  onOrderNow,
}) {
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const delivery =
    subtotal >= 2000 || subtotal === 0
      ? 0
      : 99;

  const total = subtotal + delivery;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <button
          type="button"
          className="back-order-btn"
          onClick={onBack}
        >
          ← Continue Shopping
        </button>

        <div className="cart-header">
          <div>
            <span className="eyebrow">SHOPEASY</span>
            <h1>Your Shopping Cart</h1>

            <p>
              {cart.length === 0
                ? "Your cart is waiting."
                : `${cart.length} product(s) in your cart.`}
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              className="clear-cart-btn"
              onClick={() => {
                if (
                  window.confirm("Cart empty karna hai?")
                ) {
                  onClear();
                }
              }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>

            <h2>Your cart is empty</h2>

            <p>
              Premium products add karke
              shopping start karein.
            </p>

            <button
              type="button"
              className="hero-primary"
              onClick={onBack}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <div
                  className="cart-item-card"
                  key={item._id}
                >
                  <div
                    className="cart-item-image"
                    onClick={() => onViewProduct(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        onViewProduct(item);
                      }
                    }}
                  >
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name || "ShopEasy Product"}
                        onError={(e) => {
                          console.error(
                            "Cart image error:",
                            getImageUrl(item.image)
                          );

                          e.currentTarget.src =
                            "https://placehold.co/600x500?text=ShopEasy";
                        }}
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className="cart-item-content">
                    <span className="product-category">
                      {item.category || "Premium"}
                    </span>

                    <h3 onClick={() => onViewProduct(item)}>
                      {item.name}
                    </h3>

                    <p>
                      ₹
                      {Number(item.price || 0).toLocaleString("en-IN")}
                    </p>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item._id,
                              Number(item.quantity) - 1
                            )
                          }
                          disabled={Number(item.quantity) <= 1}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item._id,
                              Number(item.quantity) + 1
                            )
                          }
                          disabled={
                            Number(item.quantity) >=
                            Number(item.stock ?? 0)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-cart-btn"
                        onClick={() => onRemove(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toLocaleString("en-IN")}
                  </div>

                  <button
                    type="button"
                    className="cart-buy-btn"
                    onClick={() => onOrderNow(item)}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <span className="eyebrow">ORDER SUMMARY</span>

              <h2>Checkout Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>
                  ₹{subtotal.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <strong>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="free-delivery-box">
                {subtotal >= 2000
                  ? "✓ You unlocked FREE delivery."
                  : `Add ₹${(2000 - subtotal).toLocaleString("en-IN")} more for FREE delivery.`}
              </div>

              <p className="cart-note">
                Payment aur order confirmation
                checkout process ke through
                complete karein.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
