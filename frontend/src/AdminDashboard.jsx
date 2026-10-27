
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminDashboard({
  onBack,
  onProducts,
  onOrders,
  onLogout,
}) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const productsResponse = await fetch(
        `${API_URL}/products`
      );

      const productsData =
        await productsResponse.json();

      const ordersResponse = await fetch(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ordersData =
        await ordersResponse.json();

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Products load failed"
        );
      }

      if (!ordersResponse.ok) {
        throw new Error(
          ordersData.message ||
            "Orders load failed"
        );
      }

      setProducts(
        productsData.products ||
          productsData ||
          []
      );

      setOrders(
        ordersData.orders || []
      );
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==========================================
  // STATS
  // ==========================================

  const revenue = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.payment?.status === "paid"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount || 0
          ),
        0
      );
  }, [orders]);

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const customers = useMemo(() => {
    const customerIds =
      orders
        .map((order) =>
          order.user?._id
            ? String(order.user._id)
            : order.user?.email
        )
        .filter(Boolean);

    return new Set(customerIds).size;
  }, [orders]);

  // ==========================================
  // RECENT ORDERS
  // ==========================================

  const recentOrders = orders.slice(
    0,
    5
  );

  const formatPrice = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="admin-dashboard-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <span className="dashboard-logo">
            S
          </span>

          <div>
            <div className="dashboard-brand-name">
              ShopEasy
            </div>

            <div className="dashboard-brand-subtitle">
              Administrator Dashboard
            </div>
          </div>

        </div>

        <div className="dashboard-header-actions">

          <button
            type="button"
            className="dashboard-btn light"
            onClick={onBack}
          >
            ← Store
          </button>

          <button
            type="button"
            className="dashboard-btn dark"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="dashboard-container">

        <div className="dashboard-intro">

          <div>
            <span className="eyebrow">
              SHOP EASY ADMIN
            </span>

            <h1>
              Dashboard Overview
            </h1>

            <p>
              Store ka complete overview
              ek jagah se manage karein.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-refresh"
            onClick={fetchDashboardData}
          >
            ↻ Refresh
          </button>

        </div>


        {/* ======================================
            STAT CARDS
        ====================================== */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon">
              ₹
            </div>

            <div>
              <span>
                Total Revenue
              </span>

              <strong>
                ₹{formatPrice(revenue)}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {orders.length}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              ⏳
            </div>

            <div>
              <span>
                Processing
              </span>

              <strong>
                {pendingOrders}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              🛍️
            </div>

            <div>
              <span>
                Products
              </span>

              <strong>
                {products.length}
              </strong>
            </div>
          </div>

        </div>


        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <section className="dashboard-actions">

          <div className="dashboard-section-title">
            <div>
              <span className="eyebrow">
                MANAGEMENT
              </span>

              <h2>
                Quick Actions
              </h2>
            </div>
          </div>


          <div className="action-grid">

            <button
              type="button"
              className="admin-action-card"
              onClick={onProducts}
            >
              <span className="action-big-icon">
                🛍️
              </span>

              <strong>
                Manage Products
              </strong>

              <span>
                Add, edit and delete products
              </span>

              <b>
                Open →
              </b>
            </button>


            <button
              type="button"
              className="admin-action-card"
              onClick={onOrders}
            >
              <span className="action-big-icon">
                📦
              </span>

              <strong>
                Manage Orders
              </strong>

              <span>
                Customer orders and delivery
              </span>

              <b>
                Open →
              </b>
            </button>


            <div className="admin-action-card info-card">
              <span className="action-big-icon">
                👥
              </span>

              <strong>
                Customers
              </strong>

              <span>
                Unique customers
              </span>

              <b>
                {customers}
              </b>
            </div>


            <div className="admin-action-card info-card">
              <span className="action-big-icon">
                🚚
              </span>

              <strong>
                Delivery
              </strong>

              <span>
                Shipped orders
              </span>

              <b>
                {shippedOrders}
              </b>
            </div>

          </div>

        </section>


        {/* ======================================
            OVERVIEW
        ====================================== */}

        <section className="dashboard-overview">

          <div className="overview-card">

            <div className="overview-card-header">
              <div>
                <span className="eyebrow">
                  ORDERS
                </span>

                <h2>
                  Order Overview
                </h2>
              </div>
            </div>

            <div className="overview-row">

              <div>
                <span>
                  Processing
                </span>

                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div>
                <span>
                  Shipped
                </span>

                <strong>
                  {shippedOrders}
                </strong>
              </div>

              <div>
                <span>
                  Delivered
                </span>

                <strong>
                  {deliveredOrders}
                </strong>
              </div>

            </div>

          </div>


          <div className="overview-card">

            <div className="overview-card-header">
              <div>
                <span className="eyebrow">
                  INVENTORY
                </span>

                <h2>
                  Product Overview
                </h2>
              </div>
            </div>

            <div className="inventory-highlight">

              <strong>
                {products.length}
              </strong>

              <span>
                Total Products
              </span>

            </div>

            <p>
              Products admin panel se
              directly manage kiye ja sakte hain.
            </p>

          </div>

        </section>


        {/* ======================================
            RECENT ORDERS
        ====================================== */}

        <section className="recent-orders-section">

          <div className="dashboard-section-header">

            <div>
              <span className="eyebrow">
                RECENT ACTIVITY
              </span>

              <h2>
                Recent Orders
              </h2>
            </div>

            <button
              type="button"
              className="dashboard-small-btn"
              onClick={onOrders}
            >
              View All Orders →
            </button>

          </div>


          {loading ? (
            <div className="dashboard-empty">
              Loading dashboard...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="dashboard-empty">

              <span>
                📦
              </span>

              <h3>
                No orders yet
              </h3>

              <p>
                Customer orders yahan dikhengi.
              </p>

            </div>
          ) : (
            <div className="recent-orders-table">

              <div className="recent-table-head">
                <span>
                  Customer
                </span>

                <span>
                  Product
                </span>

                <span>
                  Amount
                </span>

                <span>
                  Status
                </span>

                <span>
                  Date
                </span>
              </div>


              {recentOrders.map(
                (order) => (
                  <div
                    className="recent-table-row"
                    key={order._id}
                  >

                    <span>
                      <strong>
                        {order.user?.name ||
                          "Customer"}
                      </strong>

                      <small>
                        {order.user?.email ||
                          ""}
                      </small>
                    </span>


                    <span>
                      {order.items?.[0]?.name ||
                        "Order"}
                    </span>


                    <span className="amount-cell">
                      ₹
                      {formatPrice(
                        order.totalAmount
                      )}
                    </span>


                    <span>
                      <b
                        className={`mini-status ${order.status}`}
                      >
                        {order.status}
                      </b>
                    </span>


                    <span>
                      {formatDate(
                        order.createdAt
                      )}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
