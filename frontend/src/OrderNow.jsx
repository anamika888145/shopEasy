
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
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

function OrderNow({
  product,
  onBack,
  onOrderSuccess,
}) {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const stock = Math.max(
    0,
    Number(product?.stock ?? 0)
  );

  const total =
    Number(product?.price || 0) * quantity;

  const savings =
    product?.oldPrice &&
    Number(product.oldPrice) > Number(product.price)
      ? (Number(product.oldPrice) -
          Number(product.price)) *
        quantity
      : 0;

  const isOutOfStock = stock < 1;

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : {};

      setForm((prev) => ({
        ...prev,
        fullName: user?.name || "",
        phone: user?.phone || "",
      }));
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    setMessage("");

    if (isOutOfStock) {
      setMessage("This product is out of stock.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setMessage("Pehle login karein.");
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleConfirmOrder = async () => {
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Pehle login karein.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !/^[0-9]{10}$/.test(form.phone) ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !/^[0-9]{6}$/.test(form.pincode)
    ) {
      setMessage(
        "Delivery details check karein. Phone aur pincode sahi bharein."
      );
      setStep(2);
      return;
    }

    if (
      !product?._id ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > stock
    ) {
      setMessage(
        "Product quantity ya stock valid nahi hai."
      );
      setStep(1);
      return;
    }

    try {
      setLoading(true);

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay checkout load nahi ho pa raha."
        );
      }

      const orderResponse = await fetch(
        `${API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (
        !orderResponse.ok ||
        !orderData?.order?.id ||
        !orderData?.keyId
      ) {
        throw new Error(
          orderData?.message ||
            "Payment order create nahi hua."
        );
      }

      let userData = {};

      try {
        userData = JSON.parse(
          localStorage.getItem("user") || "{}"
        );
      } catch {
        userData = {};
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "ShopEasy",
        description: product.name,
        order_id: orderData.order.id,

        // Localhost product image Razorpay popup mein
        // load nahi hoti, isliye image property remove ki hai.

        prefill: {
          name: form.fullName,
          email: userData.email || "",
          contact: form.phone,
        },

        notes: {
          product: product.name,
          quantity: String(quantity),
        },

        theme: {
          color: "#ff6b35",
        },

        modal: {
          confirm_close: true,

          ondismiss: () => {
            setLoading(false);
            setMessage(
              "Payment window close kar di gayi. Aap dobara try kar sakte hain."
            );
          },
        },

        handler: async (paymentResponse) => {
          setMessage("Payment verify ho raha hai...");

          try {
            const verifyResponse = await fetch(
              `${API_URL}/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  productId: product._id,
                  quantity,

                  shippingAddress: {
                    ...form,
                  },
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData?.message ||
                  "Payment verification failed."
              );
            }

            setMessage(
              "Order successfully placed! 🎉"
            );

            alert(
              "Payment successful!\n\nYour ShopEasy order has been placed."
            );

            if (onOrderSuccess) {
              onOrderSuccess(verifyData.order);
            }
          } catch (error) {
            console.error("VERIFY ERROR:", error);

            setMessage(
              error.message ||
                "Payment verification failed."
            );

            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("PAYMENT FAILED:", response);

        setMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      });

      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      setMessage(
        error.message ||
          "Checkout mein problem aa gayi."
      );

      setLoading(false);
    }
  };

  return (
    <div className="luxury-checkout-page">
      <div className="luxury-checkout-shell">

        {/* TOP BAR */}

        <div className="checkout-topbar">
          <button
            type="button"
            className="checkout-back"
            onClick={() => {
              if (step === 3) {
                setStep(2);
                setMessage("");
              } else if (step === 2) {
                setStep(1);
                setMessage("");
              } else {
                onBack();
              }
            }}
            disabled={loading}
          >
            ← {step === 1
              ? "Continue Shopping"
              : "Back"}
          </button>

          <div className="checkout-security">
            <span>🔒</span>
            Secure Checkout
          </div>
        </div>

        {/* HEADER */}

        <div className="checkout-heading">
          <span className="checkout-eyebrow">
            SHOPEASY SIGNATURE CHECKOUT
          </span>

          <h1>
            {step === 1 && "Your Selected Product"}
            {step === 2 && "Delivery Details"}
            {step === 3 && "Review & Confirm Order"}
          </h1>

          <p>
            {step === 1 &&
              "Review your product and select quantity."}

            {step === 2 &&
              "Enter your delivery details to continue."}

            {step === 3 &&
              "Check your order details before proceeding to payment."}
          </p>
        </div>

        {/* CHECKOUT STEPS */}

        <div className="checkout-steps">
          <div
            className={`checkout-step ${
              step >= 1 ? "active" : ""
            }`}
          >
            <span>1</span>
            <small>Product</small>
          </div>

          <div
            className={`checkout-step ${
              step >= 2 ? "active" : ""
            }`}
          >
            <span>2</span>
            <small>Delivery</small>
          </div>

          <div
            className={`checkout-step ${
              step >= 3 ? "active" : ""
            }`}
          >
            <span>3</span>
            <small>Confirm</small>
          </div>
        </div>

        {message && (
          <div
            className="premium-message"
            role="status"
          >
            {message}
          </div>
        )}

        <div className="luxury-checkout-grid">

          {/* LEFT: PRODUCT */}

          <div className="checkout-left">
            <div className="checkout-product-card">

              <div className="checkout-product-image">
                {product?.image ? (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name || "ShopEasy Product"}
                    onError={(e) => {
                      console.error(
                        "OrderNow image error:",
                        getImageUrl(product.image)
                      );

                      e.currentTarget.src =
                        "https://placehold.co/600x500?text=ShopEasy";
                    }}
                  />
                ) : (
                  <div className="checkout-placeholder">
                    🛍️
                  </div>
                )}

                {product?.oldPrice &&
                  Number(product.oldPrice) > Number(product.price) && (
                    <span className="checkout-sale">
                      BEST VALUE
                    </span>
                  )}
              </div>

              <div className="checkout-product-info">
                <span className="checkout-category">
                  {product?.category || "SHOP EASY"}
                </span>

                <h2>{product?.name}</h2>

                <p>
                  {product?.description ||
                    "Premium quality product selected from ShopEasy."}
                </p>

                <div className="checkout-rating">
                  ⭐{" "}
                  {Number(product?.rating || 0).toFixed(1)}

                  <span>
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${stock} available`}
                  </span>
                </div>

                <div className="checkout-price-line">
                  <strong>
                    ₹
                    {Number(
                      product?.price || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  {product?.oldPrice &&
                    Number(product.oldPrice) >
                      Number(product.price) && (
                    <del>
                      ₹
                      {Number(
                        product.oldPrice
                      ).toLocaleString("en-IN")}
                    </del>
                  )}
                </div>

                {/* QUANTITY */}

                <div className="luxury-quantity">
                  <span>Quantity</span>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      disabled={
                        quantity <= 1 || loading
                      }
                      onClick={() =>
                        setQuantity((q) =>
                          Math.max(1, q - 1)
                        )
                      }
                    >
                      −
                    </button>

                    <strong>{quantity}</strong>

                    <button
                      type="button"
                      disabled={
                        quantity >= stock || loading
                      }
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(stock, q + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BENEFITS */}

            <div className="checkout-benefit-grid">
              <div className="checkout-benefit">
                <span>🚚</span>
                <div>
                  <strong>Fast Delivery</strong>
                  <small>Reliable delivery</small>
                </div>
              </div>

              <div className="checkout-benefit">
                <span>🔒</span>
                <div>
                  <strong>Secure Payment</strong>
                  <small>Protected checkout</small>
                </div>
              </div>

              <div className="checkout-benefit">
                <span>💎</span>
                <div>
                  <strong>Premium Quality</strong>
                  <small>Curated products</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CHECKOUT */}

          <div className="checkout-right">

            {/* STEP 1: BUY NOW */}

            {step === 1 && (
              <div className="delivery-form-card">
                <div className="checkout-section-title">
                  <div className="section-number">
                    01
                  </div>

                  <div>
                    <span>YOUR PRODUCT</span>
                    <h2>Order Summary</h2>
                  </div>
                </div>

                <div className="summary-line">
                  <span>Product</span>
                  <strong>{product?.name}</strong>
                </div>

                <div className="summary-line">
                  <span>Quantity</span>
                  <strong>{quantity}</strong>
                </div>

                <div className="summary-line">
                  <span>Subtotal</span>
                  <strong>
                    ₹{total.toLocaleString("en-IN")}
                  </strong>
                </div>

                {savings > 0 && (
                  <div className="summary-savings">
                    You save ₹
                    {savings.toLocaleString("en-IN")}
                  </div>
                )}

                <div className="summary-divider" />

                <div className="grand-total">
                  <span>Total</span>
                  <strong>
                    ₹{total.toLocaleString("en-IN")}
                  </strong>
                </div>

                <button
                  type="button"
                  className="luxury-pay-button"
                  disabled={isOutOfStock || loading}
                  onClick={() => {
                    setMessage("");

                    if (!localStorage.getItem("token")) {
                      setMessage(
                        "Order karne ke liye pehle login karein."
                      );
                      return;
                    }

                    setStep(2);
                  }}
                >
                  <span>
                    {isOutOfStock
                      ? "Out of Stock"
                      : "Buy Now"}
                  </span>

                  {!isOutOfStock && (
                    <strong>Continue →</strong>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: DELIVERY FORM */}

            {step === 2 && (
              <div className="delivery-form-card">
                <div className="checkout-section-title">
                  <div className="section-number">
                    02
                  </div>

                  <div>
                    <span>DELIVERY</span>
                    <h2>Shipping Details</h2>
                  </div>
                </div>

                <form
                  onSubmit={handleProceedToCheckout}
                >
                  <div className="luxury-input-group">
                    <label htmlFor="fullName">
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="luxury-input-group">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="luxury-input-group">
                    <label htmlFor="address">
                      Complete Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      placeholder="House no., street, locality..."
                      rows={4}
                      value={form.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      required
                    />
                  </div>

                  <div className="luxury-two-column">
                    <div className="luxury-input-group">
                      <label htmlFor="city">
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        required
                      />
                    </div>

                    <div className="luxury-input-group">
                      <label htmlFor="state">
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        required
                      />
                    </div>
                  </div>

                  <div className="luxury-input-group">
                    <label htmlFor="pincode">
                      Pincode
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      autoComplete="postal-code"
                      required
                    />
                  </div>

                  <div className="checkout-summary-card">
                    <div className="summary-line">
                      <span>
                        {product?.name} × {quantity}
                      </span>

                      <strong>
                        ₹{total.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="summary-line">
                      <span>Delivery</span>
                      <strong className="free-text">
                        FREE
                      </strong>
                    </div>

                    <div className="summary-divider" />

                    <div className="grand-total">
                      <span>Total Payable</span>
                      <strong>
                        ₹{total.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="luxury-pay-button"
                    disabled={loading || isOutOfStock}
                  >
                    <span>Proceed to Checkout</span>
                    <strong>→</strong>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: CONFIRM ORDER */}

            {step === 3 && (
              <div className="delivery-form-card">
                <div className="checkout-section-title">
                  <div className="section-number">
                    03
                  </div>

                  <div>
                    <span>FINAL REVIEW</span>
                    <h2>Confirm Your Order</h2>
                  </div>
                </div>

                <div className="checkout-summary-card">
                  <h3>Product Details</h3>

                  <div className="summary-line">
                    <span>Product</span>
                    <strong>{product?.name}</strong>
                  </div>

                  <div className="summary-line">
                    <span>Quantity</span>
                    <strong>{quantity}</strong>
                  </div>

                  <div className="summary-line">
                    <span>Price per item</span>
                    <strong>
                      ₹
                      {Number(
                        product?.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="summary-divider" />

                  <h3>Delivery Address</h3>

                  <p>
                    <strong>{form.fullName}</strong>
                  </p>

                  <p>{form.phone}</p>

                  <p>
                    {form.address}
                    <br />
                    {form.city}, {form.state}
                    <br />
                    PIN: {form.pincode}
                  </p>

                  <div className="summary-divider" />

                  <div className="summary-line">
                    <span>Subtotal</span>
                    <strong>
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="summary-line">
                    <span>Delivery</span>
                    <strong className="free-text">
                      FREE
                    </strong>
                  </div>

                  {savings > 0 && (
                    <div className="summary-savings">
                      You save ₹
                      {savings.toLocaleString("en-IN")}
                    </div>
                  )}

                  <div className="summary-divider" />

                  <div className="grand-total">
                    <span>Total Payable</span>
                    <strong>
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="payment-trust">
                  <span>🔐</span>

                  <div>
                    <strong>
                      Secure & Encrypted Payment
                    </strong>

                    <small>
                      Payment handled by Razorpay
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="luxury-pay-button"
                  disabled={loading || isOutOfStock}
                  onClick={handleConfirmOrder}
                >
                  <span>
                    {loading
                      ? "Processing..."
                      : "Confirm Order & Pay"}
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : `₹${total.toLocaleString("en-IN")} →`}
                  </strong>
                </button>

                <button
                  type="button"
                  className="checkout-back"
                  disabled={loading}
                  onClick={() => {
                    setStep(2);
                    setMessage("");
                  }}
                >
                  ← Edit Delivery Details
                </button>

                <p className="checkout-terms">
                  Clicking Confirm Order & Pay opens
                  Razorpay. Your order is treated as
                  successful only after payment
                  verification succeeds.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderNow;
