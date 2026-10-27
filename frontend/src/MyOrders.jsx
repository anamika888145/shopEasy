
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

function MyOrders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // FORMAT DATE + TIME
  // ==========================================
  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // GET TRACKING DATES
  // ==========================================
  const getTrackingDates = (order) => {
    const orderDate = order?.createdAt
      ? new Date(order.createdAt)
      : new Date();

    if (
      order?.tracking?.processingAt &&
      order?.tracking?.shippedAt &&
      order?.tracking?.deliveredAt
    ) {
      return {
        processingAt: new Date(order.tracking.processingAt),
        shippedAt: new Date(order.tracking.shippedAt),
        deliveredAt: new Date(order.tracking.deliveredAt),
      };
    }

    // Old orders: fallback dates
    const shippedAt = new Date(
      orderDate.getTime() + 2 * 24 * 60 * 60 * 1000
    );

    const deliveredAt = new Date(
      orderDate.getTime() + 5 * 24 * 60 * 60 * 1000
    );

    return {
      processingAt: orderDate,
      shippedAt,
      deliveredAt,
    };
  };

  // ==========================================
  // GET CURRENT STATUS
  // ==========================================
  const getCurrentStatus = (order) => {
    const backendStatus = String(order?.status || "")
      .toLowerCase()
      .trim();

    // Backend status has priority
    if (
      ["cancelled", "canceled"].includes(backendStatus)
    ) {
      return "cancelled";
    }

    if (
      ["processing", "shipped", "delivered"].includes(
        backendStatus
      )
    ) {
      return backendStatus;
    }

    // Fallback only when backend status is missing/unknown
    const dates = getTrackingDates(order);
    const now = new Date();

    if (now >= dates.deliveredAt) {
      return "delivered";
    }

    if (now >= dates.shippedAt) {
      return "shipped";
    }

    return "processing";
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================
  const getStatusLabel = (status) => {
    switch (status) {
      case "processing":
        return "Processing";

      case "shipped":
        return "Shipped";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return "Processing";
    }
  };

  // ==========================================
  // CHECK TRACKING STEP
  // ==========================================
  const isStepCompleted = (currentStatus, step) => {
    const statusOrder = {
      processing: 1,
      shipped: 2,
      delivered: 3,
    };

    if (currentStatus === "cancelled") {
      return false;
    }

    return statusOrder[currentStatus] >= statusOrder[step];
  };

  // ==========================================
  // TRACKING DATE LABEL
  // ==========================================
  const getTrackingDateLabel = (
    date,
    currentStatus,
    step
  ) => {
    if (!date) return "-";

    const completed = isStepCompleted(
      currentStatus,
      step
    );

    return completed
      ? formatDate(date)
      : `Estimated: ${formatDate(date)}`;
  };

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token nahi mila. Pehle login karein."
        );
      }

      if (showRefreshLoader) {
        setRefreshing(true);
      }

      const response = await fetch(`${API_URL}/orders/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("MY ORDERS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Orders load nahi ho rahe."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("MY ORDERS ERROR:", error);

      if (!showRefreshLoader) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // LOAD + AUTO REFRESH
  // ==========================================
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // MANUAL REFRESH
  // ==========================================
  const handleRefresh = async () => {
    await fetchOrders(true);
  };

  return (
    <div className="orders-page">
      <div className="orders-container">

        {/* BACK */}
        <button
          className="back-order-btn"
          onClick={onBack}
        >
          ← Back to Store
        </button>

        {/* HEADER */}
        <div className="orders-header">
          <div>
            <span className="eyebrow">
              SHOPEASY ACCOUNT
            </span>

            <h1>My Orders</h1>

            <p>
              Apne orders, payment aur delivery
              status yahan dekhein.
            </p>
          </div>

          <button
            className="refresh-orders"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>

            <h2>Orders load ho rahe hain...</h2>

            <p>Please wait.</p>
          </div>
        ) : orders.length === 0 ? (
          /* NO ORDERS */
          <div className="orders-empty">
            <div className="empty-icon">🛍️</div>

            <h2>No orders yet</h2>

            <p>
              Abhi tak koi order place nahi kiya.
            </p>

            <button
              className="hero-primary"
              onClick={onBack}
              style={{ marginTop: "15px" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="orders-list">
            {orders.map((order) => {
              const currentStatus = getCurrentStatus(order);
              const trackingDates = getTrackingDates(order);

              return (
                <div
                  className="order-card"
                  key={order._id}
                >

                  {/* ORDER HEADER */}
                  <div className="order-top">
                    <div>
                      <span className="order-label">
                        ORDER ID
                      </span>

                      <strong>{order._id}</strong>

                      <small>
                        Ordered on {formatDate(order.createdAt)}
                      </small>
                    </div>

                    <span
                      className={`order-status status-${currentStatus}`}
                    >
                      {getStatusLabel(currentStatus)}
                    </span>
                  </div>

                  {/* ORDER ITEMS */}
                  {order.items?.map((item, index) => (
                    <div
                      className="order-item"
                      key={`${order._id}-${index}`}
                    >
                     <div className="order-item-image">
  {item.image ? (
    <img
      src={getImageUrl(item.image)}
      alt={item.name || "Product"}
      onError={(e) => {
        console.error(
          "Order image failed:",
          getImageUrl(item.image)
        );

        e.currentTarget.src =
          "https://placehold.co/300x300?text=No+Image";
      }}
    />
  ) : (
    <span>🛍️</span>
  )}
</div>
                      <div className="order-item-info">
                        <h3>{item.name}</h3>

                        <p>
                          ₹
                          {Number(item.price || 0).toLocaleString(
                            "en-IN"
                          )}
                          {" × "}
                          {item.quantity}
                        </p>

                        <small>
                          Item Total: ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString("en-IN")}
                        </small>
                      </div>
                    </div>
                  ))}

                  {/* TOTAL + PAYMENT */}
                  <div className="admin-order-info">
                    <div>
                      <span className="order-label">
                        TOTAL AMOUNT
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span className="order-label">
                        PAYMENT
                      </span>

                      <strong
                        style={{ textTransform: "capitalize" }}
                      >
                        {order.payment?.status || "Not available"}
                      </strong>
                    </div>
                  </div>

                  {/* DELIVERY TRACKING */}
                  {currentStatus === "cancelled" ? (
                    <div className="order-tracking-box">
                      <div className="tracking-message">
                        ❌ This order has been cancelled.
                      </div>
                    </div>
                  ) : (
                    <div className="order-tracking-box">
                      <div className="tracking-title">
                        <span className="eyebrow">
                          ORDER TRACKING
                        </span>

                        <h3>Delivery Timeline</h3>
                      </div>

                      <div className="delivery-progress">

                        {/* PROCESSING */}
                        <div
                          className={
                            isStepCompleted(
                              currentStatus,
                              "processing"
                            )
                              ? "tracking-step active"
                              : "tracking-step"
                          }
                        >
                          <div className="tracking-dot">
                            {isStepCompleted(
                              currentStatus,
                              "processing"
                            )
                              ? "✓"
                              : "1"}
                          </div>

                          <div>
                            <strong>Processing</strong>

                            <small>
                              {getTrackingDateLabel(
                                trackingDates.processingAt,
                                currentStatus,
                                "processing"
                              )}
                            </small>

                            <em>
                              {formatDateTime(
                                trackingDates.processingAt
                              )}
                            </em>
                          </div>
                        </div>

                        {/* LINE */}
                        <div
                          className={
                            isStepCompleted(
                              currentStatus,
                              "shipped"
                            )
                              ? "tracking-line active"
                              : "tracking-line"
                          }
                        ></div>

                        {/* SHIPPED */}
                        <div
                          className={
                            isStepCompleted(
                              currentStatus,
                              "shipped"
                            )
                              ? "tracking-step active"
                              : "tracking-step"
                          }
                        >
                          <div className="tracking-dot">
                            {isStepCompleted(
                              currentStatus,
                              "shipped"
                            )
                              ? "✓"
                              : "2"}
                          </div>

                          <div>
                            <strong>Shipped</strong>

                            <small>
                              {getTrackingDateLabel(
                                trackingDates.shippedAt,
                                currentStatus,
                                "shipped"
                              )}
                            </small>

                            <em>
                              {formatDateTime(
                                trackingDates.shippedAt
                              )}
                            </em>
                          </div>
                        </div>

                        {/* LINE */}
                        <div
                          className={
                            isStepCompleted(
                              currentStatus,
                              "delivered"
                            )
                              ? "tracking-line active"
                              : "tracking-line"
                          }
                        ></div>

                        {/* DELIVERED */}
                        <div
                          className={
                            isStepCompleted(
                              currentStatus,
                              "delivered"
                            )
                              ? "tracking-step active"
                              : "tracking-step"
                          }
                        >
                          <div className="tracking-dot">
                            {isStepCompleted(
                              currentStatus,
                              "delivered"
                            )
                              ? "✓"
                              : "3"}
                          </div>

                          <div>
                            <strong>Delivered</strong>

                            <small>
                              {getTrackingDateLabel(
                                trackingDates.deliveredAt,
                                currentStatus,
                                "delivered"
                              )}
                            </small>

                            <em>
                              {formatDateTime(
                                trackingDates.deliveredAt
                              )}
                            </em>
                          </div>
                        </div>
                      </div>

                      {/* STATUS MESSAGE */}
                      <div className="tracking-message">
                        {currentStatus === "processing" && (
                          <>
                            📦 Your order is being prepared.
                          </>
                        )}

                        {currentStatus === "shipped" && (
                          <>
                            🚚 Your order has been shipped.
                          </>
                        )}

                        {currentStatus === "delivered" && (
                          <>
                            🎉 Your order has been delivered.
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DELIVERY ADDRESS */}
                  {order.shippingAddress && (
                    <div className="delivery-address">
                      <span className="order-label">
                        DELIVERY ADDRESS
                      </span>

                      <strong>
                        {order.shippingAddress.fullName}
                      </strong>

                      <p>
                        {order.shippingAddress.address}
                        <br />

                        {order.shippingAddress.city}
                        ,{" "}
                        {order.shippingAddress.state}
                        {" - "}
                        {order.shippingAddress.pincode}
                        <br />

                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>
                  )}

                  {/* PAYMENT ID */}
                  {order.payment?.paymentId && (
                    <div className="payment-info">
                      <span className="order-label">
                        PAYMENT ID
                      </span>

                      <span className="payment-id">
                        {order.payment.paymentId}
                      </span>
                    </div>
                  )}

                  {/* ORDER DATE */}
                  <div className="order-date">
                    Order placed on{" "}
                    {formatDateTime(order.createdAt)}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
