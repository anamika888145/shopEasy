
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

function AdminOrders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Orders load failed"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Status update failed"
        );
      }

      await fetchOrders();

      alert(
        `Order status: ${status}`
      );
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      alert(error.message);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-container">

        <button
          className="back-order-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="orders-header">
          <div>
            <span className="eyebrow">
              ADMIN
            </span>

            <h1>Customer Orders</h1>

            <p>
              Orders manage aur delivery status
              update karein.
            </p>
          </div>

          <button
            className="refresh-orders"
            onClick={fetchOrders}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="orders-empty">
            Orders load ho rahe hain...
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">
              📦
            </div>

            <h2>No orders yet</h2>
          </div>
        ) : (
          <div className="orders-list">

            {orders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                <div className="order-top">
                  <div>
                    <span className="order-label">
                      CUSTOMER
                    </span>

                    <strong>
                      {order.user?.name ||
                        "Customer"}
                    </strong>

                    <small>
                      {order.user?.email}
                    </small>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                    className="status-select"
                  >
                    <option value="processing">
                      Processing
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                {order.items?.map(
                  (item, index) => (
                    <div
                      className="order-item"
                      key={index}
                    >
                      <div className="order-item-image">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            onError={(e) => {
                              console.error(
                                "ADMIN ORDER IMAGE ERROR:",
                                getImageUrl(item.image)
                              );

                              e.currentTarget.style.display = "none";
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
                          {Number(
                            item.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                          {" × "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                  )
                )}

                <div className="admin-order-info">
                  <div>
                    <span className="order-label">
                      TOTAL
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.totalAmount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span className="order-label">
                      PAYMENT
                    </span>

                    <strong>
                      {order.payment
                        ?.status || "paid"}
                    </strong>
                  </div>
                </div>

                <div className="delivery-address">
                  <strong>
                    Delivery Address
                  </strong>

                  <p>
                    {order.shippingAddress
                      ?.fullName}
                    <br />

                    {order.shippingAddress
                      ?.address}
                    <br />

                    {order.shippingAddress
                      ?.city}
                    ,{" "}
                    {order.shippingAddress
                      ?.state}
                    {" - "}
                    {order.shippingAddress
                      ?.pincode}
                    <br />

                    Phone:{" "}
                    {order.shippingAddress
                      ?.phone}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;