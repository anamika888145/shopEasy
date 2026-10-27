import { useEffect, useMemo, useState } from "react";

import RegisterForm from "./RegisterForm";
import AdminProducts from "./AdminProducts";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import OrderNow from "./OrderNow";
import MyOrders from "./MyOrders";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart";
import Wishlist from "./Wishlist";
import LoginForm from "./LoginForm";

import "./index.css";

const API_URL = "http://localhost:5000/api";
const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

function App() {
  // ==========================================
  // PRODUCT DATA
  // ==========================================
  
  const [showAnamikaProfile, setShowAnamikaProfile] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
const [showShopMenu, setShowShopMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [showDashboard, setShowDashboard] =
  useState(false);
  // ==========================================
  // AUTH
  // ==========================================

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || null
      );
    } catch {
      return null;
    }
  });

  // ==========================================
  // PAGES
  // ==========================================

  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdminOrders, setShowAdminOrders] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [productDetails, setProductDetails] =
    useState(null);

  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] =
    useState(false);

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // ==========================================
  // CART
  // ==========================================
 
  const [cart, setCart] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("shopeasy_cart")
        ) || []
      );
    } catch {
      return [];
    }
  });

  // ==========================================
  // WISHLIST
  // ==========================================

  const [wishlist, setWishlist] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "shopeasy_wishlist"
          )
        ) || []
      );
    } catch {
      return [];
    }
  });

  // ==========================================
  // SAVE CART
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "shopeasy_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // ==========================================
  // SAVE WISHLIST
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "shopeasy_wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

 
 
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load products."
        );
      }

      const productList = Array.isArray(data)
        ? data
        : data?.products;

      setProducts(
        Array.isArray(productList) ? productList : []
      );
    } catch (error) {
      console.error("PRODUCT FETCH ERROR:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map(
            (product) => product.category
          )
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  // ==========================================
  // FILTER
  // ==========================================

  
const filteredProducts = useMemo(() => {
  const searchTerm = search.trim().toLowerCase();

  return (Array.isArray(products) ? products : []).filter((product) => {
    const name = String(product?.name ?? "").toLowerCase();
    const description = String(product?.description ?? "").toLowerCase();
    const category = String(product?.category ?? "").toLowerCase();

    const matchesSearch =
      !searchTerm ||
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      category.includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      String(product?.category ?? "") === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}, [products, search, selectedCategory]);


  // ==========================================
  // AUTH
  // ==========================================
const handleLoginSuccess = (loggedInUser, token) => {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (loggedInUser) {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  setLoggedIn(Boolean(token) || Boolean(localStorage.getItem("token")));
  setShowLogin(false);
  setShowRegister(false);
};

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);

    setShowAdmin(false);
    setShowOrders(false);
    setShowAdminOrders(false);
    setProductDetails(null);
    setSelectedProduct(null);
    setShowCart(false);
    setShowWishlist(false);
  };

  // ==========================================
  // CART ACTIONS
  // ==========================================

  
  const updateCartQuantity = (productId, nextQuantity) => {
    const quantity = Number(nextQuantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        const stock = Number(item.stock ?? 0);

        if (stock < 1) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(
            Math.floor(quantity),
            stock
          ),
        };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item._id !== productId
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleAddToCart = (product, quantity = 1) => {
    const stock = Number(product?.stock ?? 0);
    const requestedQuantity = Number(quantity);

    if (!product?._id) {
      alert("Invalid product.");
      return;
    }

    if (stock < 1) {
      alert("Product out of stock.");
      return;
    }

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      alert("Please select a valid quantity.");
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  stock,
                  Number(item.quantity || 0) +
                    Math.floor(requestedQuantity)
                ),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: Math.min(
            stock,
            Math.floor(requestedQuantity)
          ),
        },
      ];
    });

    handleCart();
  };

  // ==========================================
  // WISHLIST
  // ==========================================

  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        item._id === productId
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists =
        currentWishlist.some(
          (item) =>
            item._id === product._id
        );

      if (exists) {
        return currentWishlist.filter(
          (item) =>
            item._id !== product._id
        );
      }

      return [
        ...currentWishlist,
        product,
      ];
    });
  };

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================

  const handleProductDetails = (
    product
  ) => {
    setProductDetails(product);

    setShowCart(false);
    setShowWishlist(false);
    setShowOrders(false);
    setShowAdmin(false);
    setShowAdminOrders(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ORDER NOW
  // ==========================================

  const handleOrderNow = (
    product
  ) => {
    console.log(
      "ORDER NOW CLICKED:",
      product
    );

    if (!loggedIn) {
      alert(
        "Order karne ke liye pehle login karein."
      );

      setShowLogin(true);
      setShowRegister(false);
      return;
    }

    setSelectedProduct(product);

    setProductDetails(null);
    setShowCart(false);
    setShowWishlist(false);
    setShowOrders(false);
    setShowAdmin(false);
    setShowAdminOrders(false);
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const resetPages = () => {
    setShowDashboard(false);
    setShowAdmin(false);
    setShowOrders(false);
    setShowAdminOrders(false);
    setShowCart(false);
    setShowWishlist(false);
    setProductDetails(null);
    setSelectedProduct(null);
  };

  const handleMyOrders = () => {
    if (!loggedIn) {
      setShowLogin(true);
      setShowRegister(false);
      return;
    }

    resetPages();
    setShowOrders(true);
  };

  const handleCart = () => {
    resetPages();
    setShowCart(true);
  };

  const handleWishlist = () => {
    resetPages();
    setShowWishlist(true);
  };

  const handleAdmin = () => {
    if (!loggedIn || user?.role !== "admin") {
      alert("Admin access required.");
      return;
    }

    resetPages();
    setShowDashboard(true);
  };

  const handleAdminOrders = () => {
    if (!loggedIn || user?.role !== "admin") {
      alert("Admin access required.");
      return;
    }

    resetPages();
    setShowAdminOrders(true);
  };

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  if (
    selectedProduct &&
    loggedIn
  ) {
    return (
      <OrderNow
        product={selectedProduct}
        onBack={() =>
          setSelectedProduct(null)
        }
        onOrderSuccess={() => {
          setSelectedProduct(null);
          setCart([]);
          fetchProducts();
          setShowOrders(true);
        }}
      />
    );
  }

if (
  showDashboard &&
  loggedIn &&
  user?.role === "admin"
) {
  return (
    <AdminDashboard
      onBack={() => {
        setShowDashboard(false);
      }}
      onProducts={() => {
        setShowDashboard(false);
        setShowAdmin(true);
      }}
      onOrders={() => {
        setShowDashboard(false);
        setShowAdminOrders(true);
      }}
      onLogout={handleLogout}
    />
  );
}

  // ==========================================
  // MY ORDERS
  // ==========================================

  if (
    showOrders &&
    loggedIn
  ) {
    return (
      <MyOrders
        onBack={() =>
          setShowOrders(false)
        }
      />
    );
  }

  // ==========================================
  // ADMIN ORDERS
  // ==========================================

  if (
    showAdminOrders &&
    loggedIn &&
    user?.role === "admin"
  ) {
    return (
      <AdminOrders
        onBack={() =>
          setShowAdminOrders(false)
        }
      />
    );
  }

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================

  if (productDetails) {
    return (
      <ProductDetails
        product={
          productDetails
        }
        isInWishlist={isInWishlist(
          productDetails._id
        )}
        onWishlist={() =>
          toggleWishlist(
            productDetails
          )
        }
        onAddToCart={handleAddToCart}
        onOrderNow={
          handleOrderNow
        }
        onBack={() =>
          setProductDetails(null)
        }
      />
    );
  }

  // ==========================================
  // CART
  // ==========================================
if (showCart) {
  return (
    <Cart
      cart={cart}
      onBack={() => setShowCart(false)}
      onUpdateQuantity={updateCartQuantity}
      onRemove={removeFromCart}
      onClear={clearCart}
      onViewProduct={handleProductDetails}
      onOrderNow={handleOrderNow}
    />
  );
}
  // ==========================================
  // WISHLIST
  // ==========================================

  if (showWishlist) {
    return (
      <Wishlist
        wishlist={wishlist}
        onBack={() =>
          setShowWishlist(false)
        }
        onToggleWishlist={
          toggleWishlist
        }
        onAddToCart={
          handleAddToCart
        }
        onOrderNow={
          handleOrderNow
        }
        onViewProduct={
          handleProductDetails
        }
      />
    );
  }

  // ==========================================
  // ADMIN PRODUCTS
  // ==========================================

  if (
    showAdmin &&
    loggedIn &&
    user?.role === "admin"
  ) {
    return (
      <div className="premium-page">

        <header className="premium-header">

          <div className="brand">
            <span className="brand-icon">
              S
            </span>

            <div>
              <div className="brand-name">
                ShopEasy
              </div>

              <div className="brand-tagline">
                Premium Shopping
              </div>
            </div>
          </div>

          <div className="header-actions">

            <button
              type="button"
              className="header-btn secondary-btn"
              onClick={() => {
                setShowAdmin(false);
                fetchProducts();
              }}
            >
              ← Back to Store
            </button>

             <button
               type="button"
               className="header-btn secondary-btn"
               onClick={() => {
                 setShowAdmin(false);
                 setShowDashboard(true);
                 fetchProducts();
               }}
             >
               ← Dashboard
             </button>

            <button
              type="button"
              className="header-btn secondary-btn"
              onClick={
                handleAdminOrders
              }
            >
              Orders
            </button>

            <button
              type="button"
              className="header-btn dark-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>

        <main className="admin-wrapper">

          <div className="admin-heading">

            <span className="eyebrow">
              SHOP EASY
            </span>

            <h1>
              Admin Product Studio
            </h1>

            <p>
              Products add, update aur
              delete karein.
            </p>

          </div>

          <AdminProducts />

        </main>

      </div>
    );
  }

  // ==========================================
  // STORE
  // ==========================================

  return (
    <div className="premium-page">

      {/* HEADER */}

{/* LUXURY HEADER */}
<header className="luxury-header">
  <div className="luxury-header-main">

    {/* MOBILE MENU BUTTON */}
    <button
      type="button"
      className="luxury-menu-btn"
      onClick={() => setShowMobileMenu(!showMobileMenu)}
      aria-label="Toggle navigation menu"
      aria-expanded={showMobileMenu}
    >
      {showMobileMenu ? "✕" : "☰"}
    </button>

    {/* BRAND */}
    <button
      type="button"
      className="luxury-brand"
      onClick={() => {
        setSelectedCategory("All");
        setSearch("");
        setShowMobileMenu(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <span className="luxury-brand-icon">S</span>

      <span className="luxury-brand-copy">
        <span className="luxury-brand-name">ShopEasy</span>
        <span className="luxury-brand-tagline">
          BETTER CHOICES. BRIGHTER LIFE.
        </span>
      </span>
    </button>

    {/* DESKTOP NAVIGATION */}
    <nav className="luxury-nav" aria-label="Main navigation">
      <button
        type="button"
        className="luxury-nav-link active"
        onClick={() => {
          setSelectedCategory("All");
          setSearch("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        Home
      </button>

      <div
        className="luxury-nav-dropdown"
        onMouseEnter={() => setShowShopMenu(true)}
        onMouseLeave={() => setShowShopMenu(false)}
      >
        <button
          type="button"
          className="luxury-nav-link"
          onClick={() => setShowShopMenu(!showShopMenu)}
          aria-expanded={showShopMenu}
        >
          Shop <span className="luxury-chevron">⌄</span>
        </button>

        {showShopMenu && (
          <div className="luxury-mega-menu">
            <div className="luxury-mega-heading">
              <span>EXPLORE SHOP</span>
              <h3>Find your favourites.</h3>
              <p>Thoughtfully selected for everyday living.</p>
            </div>

            <div className="luxury-category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowShopMenu(false);
                    setShowMobileMenu(false);
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {category}
                  <span>→</span>
                </button>
              ))}
            </div>

            <div className="luxury-menu-promo">
              <span>THE SHOP EASY EDIT</span>
              <h3>Everyday pieces. Elevated.</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setShowShopMenu(false);
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore collection →
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="luxury-nav-link"
        onClick={() => {
          setSelectedCategory("All");
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Collections
      </button>

      <button
        type="button"
        className="luxury-nav-link"
        onClick={() => {
          setSelectedCategory("All");
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Discover
      </button>
    </nav>

    {/* SEARCH */}
   <div className="luxury-search">
  <input
    type="search"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => e.stopPropagation()}
    aria-label="Search products"
    autoComplete="off"
  />
  <span className="luxury-search-icon" aria-hidden="true">
    ⌕
  </span>
</div>

    {/* WISHLIST */}
    <button
      type="button"
      className="luxury-icon-btn"
      onClick={handleWishlist}
      aria-label={`Wishlist, ${wishlist.length} items`}
    >
      <span className="luxury-heart">♡</span>
      {wishlist.length > 0 && (
        <span className="luxury-count">{wishlist.length}</span>
      )}
    </button>

    {/* CART */}
    <button
      type="button"
      className="luxury-icon-btn"
      onClick={handleCart}
      aria-label={`Cart, ${cartCount} items`}
    >
      <span className="luxury-cart-icon">♧</span>
      <span className="luxury-count">{cartCount}</span>
    </button>

    {/* ACCOUNT: EXISTING ACTIONS PRESERVED */}
    <div className="luxury-account">
      {loggedIn ? (
        <>
          <button
            type="button"
            className="luxury-account-trigger"
          onClick={() => setShowAccountMenu((prev) => !prev)}
          >
            <span className="luxury-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </span>
            <span className="luxury-account-name">
              {user?.name || "My Account"}
            </span>
            <span>⌄</span>
          </button>

         {showAccountMenu && (
             <div className="luxury-account-menu">
            <button type="button" onClick={handleMyOrders}>
              My Orders
            </button>

     {user?.role === "admin" && (
  <>
    <button type="button" onClick={handleAdmin}>
      Admin Dashboard
    </button>

    <button type="button" onClick={handleAdminOrders}>
      Manage Orders
    </button>
  </>
)}

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
         )}
        </>
      ) : (
        <div className="luxury-auth-actions">
          <button
            type="button"
            className="luxury-login-btn"
            onClick={() => {
              setShowLogin(true);
              setShowRegister(false);
            }}
          >
            Login
          </button>

          <button
            type="button"
            className="luxury-register-btn"
            onClick={() => {
              setShowRegister(true);
              setShowLogin(false);
            }}
          >
            Join Us
          </button>
        </div>
      )}
    </div>
  </div>

  {/* MOBILE NAVIGATION */}
  {showMobileMenu && (
    <nav className="luxury-mobile-menu" aria-label="Mobile navigation">
      <button
        type="button"
        onClick={() => {
          setSelectedCategory("All");
          setShowMobileMenu(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        Home <span>→</span>
      </button>

      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() => {
            setSelectedCategory(category);
            setShowMobileMenu(false);
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {category} <span>→</span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => {
          setShowMobileMenu(false);
          handleWishlist();
        }}
      >
        My Wishlist <span>→</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setShowMobileMenu(false);
          handleCart();
        }}
      >
        Shopping Cart <span>→</span>
      </button>
    </nav>
  )}
</header>



      {/* HERO */}

      
<section className="hero-section luxury-hero">

  <div className="hero-content">

    <span className="hero-premium-badge">
      ✦ CURATED FOR MODERN LIVING
    </span>

    <span className="eyebrow">
      NEW SEASON 2026
    </span>

    <h1>
      Designed for
      <br />
      <span>
        modern living.
      </span>
    </h1>

    <p>
      Discover elevated essentials, refined
      fashion and premium everyday products
      curated for your lifestyle.
    </p>

    <div className="hero-buttons">

      <button
        type="button"
        className="hero-primary"
        onClick={() =>
          document
            .getElementById("products")
            ?.scrollIntoView({
              behavior: "smooth",
            })
        }
      >
        Shop Collection →
      </button>

      <button
        type="button"
        className="hero-secondary"
        onClick={() => {
          setSelectedCategory(
            "Women's Clothing"
          );

          setTimeout(() => {
            document
              .getElementById("products")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }, 100);
        }}
      >
        Women's Edit
      </button>

    </div>
<div className="premium-highlights">

  <button
    className="highlight-item"
    onClick={() => {
      setShowOrders(false);
      setShowCart(false);
      setShowWishlist(false);
      setProductDetails(null);

      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }}
  >
    <span>✦</span>
    <strong>Premium Selection</strong>
    <small>Explore →</small>
  </button>

  <button
    className="highlight-item"
    onClick={() => {
      setShowOrders(false);
      setShowWishlist(false);
      setProductDetails(null);
      setShowCart(true);
    }}
  >
    <span>✦</span>
    <strong>Secure Checkout</strong>
    <small>Go To Cart →</small>
  </button>

  <button
    className="highlight-item"
    onClick={() => {
      setShowOrders(false);
      setShowCart(false);
      setProductDetails(null);
      setShowWishlist(true);
    }}
  >
    <span>✦</span>
    <strong>Easy Shopping</strong>
    <small>Wishlist →</small>
  </button>

</div>


  </div>

  <div className="hero-card luxury-hero-card">

    <div className="hero-card-glow"></div>

    <div className="hero-floating-label">
      WOMEN'S EDIT
    </div>

    <div className="hero-card-content">

      <span className="mini-label">
        SIGNATURE COLLECTION
      </span>

      <h3>
        Timeless pieces.
        <br />
        Modern attitude.
      </h3>

      <p>
        Explore elegant fashion and premium
        essentials selected by ShopEasy.
      </p>

      <div className="hero-stat-row">

        <div>
          <strong>
            {products.length}+
          </strong>

          <span>
            Products
          </span>
        </div>

        <div>
          <strong>
            4.8
          </strong>

          <span>
            Avg. Rating
          </span>
        </div>

        <div>
          <strong>
            24/7
          </strong>

          <span>
            Shopping
          </span>
        </div>

      </div>

    </div>

  </div>

</section>


      {/* PRODUCTS */}

      <main
        id="products"
        className="products-section"
      >

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              SHOP EASY COLLECTION
            </span>

            <h2>
              Featured Products
            </h2>

          </div>

          <span className="product-total">
            {filteredProducts.length}{" "}
            results
          </span>

        </div>

        {filteredProducts.length ===
        0 ? (
          <div className="empty-products">

            <div className="empty-icon">
              🛍️
            </div>

            <h3>
              {products.length ===
              0
                ? "No products added yet"
                : "No products found"}
            </h3>

            <p>
              {products.length ===
              0
                ? "Admin dashboard se pehla product add karein."
                : "Search ya category change karke dobara try karein."}
            </p>

            {user?.role ===
              "admin" &&
              products.length ===
                0 && (
                <button
                  type="button"
                  className="hero-primary"
                  onClick={
                    handleAdmin
                  }
                >
                  Add First Product
                </button>
              )}

          </div>
        ) : (
          <div className="product-grid">

            {filteredProducts.map(
              (product) => (
                <article
                  className="premium-product-card"
                  key={
                    product._id
                  }
                >

                  {/* IMAGE */}

                {/* IMAGE */}

<div
  className="product-image-wrap product-click-area"
  onClick={() => handleProductDetails(product)}
>
  {product.image ? (
    <img
      src={getImageUrl(product.image)}
      alt={product.name}
      className="product-image"
      onError={(e) => {
        console.error(
          "Image load failed:",
          getImageUrl(product.image)
        );

        e.currentTarget.src =
          "https://placehold.co/600x500?text=ShopEasy";
      }}
    />
  ) : (
    <div className="image-placeholder">
      🛍️
    </div>
  )}

  {product.oldPrice &&
    Number(product.oldPrice) > Number(product.price) && (
      <span className="sale-badge">
        SALE
      </span>
    )}

  <button
    type="button"
    className={`wishlist-card-btn ${
      isInWishlist(product._id) ? "wish-active" : ""
    }`}
    onClick={(e) => {
      e.stopPropagation();
      toggleWishlist(product);
    }}
  >
    {isInWishlist(product._id) ? "♥" : "♡"}
  </button>
</div>

                  {/* DETAILS */}

                  <div className="product-details">

                    <span className="product-category">
                      {product.category ||
                        "Premium"}
                    </span>

                    <h3
                      className="product-title-click"
                      onClick={() =>
                        handleProductDetails(
                          product
                        )
                      }
                    >
                      {product.name}
                    </h3>

                    <p className="product-description">
                      {product.description ||
                        "Premium quality product from ShopEasy."}
                    </p>

                    <div className="rating-row">

                      <span>
                        ⭐{" "}
                        {Number(
                          product.rating ||
                            0
                        ).toFixed(1)}
                      </span>

                      <span>
                        {Number(
                          product.stock ||
                            0
                        ) > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>

                    </div>

                    <div className="price-row">

                      <div>

                        <span className="current-price">
                          ₹
                          {Number(
                            product.price ||
                              0
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
                            <span className="old-price">
                              ₹
                              {Number(
                                product.oldPrice
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                      </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="product-actions">
                       <button
                         type="button"
                         className="add-to-cart-btn"
                         onClick={() => handleAddToCart(product)}
                       >
                         Add to Cart
                       </button>                                       

                      <button
                        type="button"
                        className="order-btn"
                        onClick={() =>
                          handleOrderNow(
                            product
                          )
                        }
                      >
                        Order Now
                      </button>

                    </div>

                    <button
                      type="button"
                      className="quick-view-btn"
                      onClick={() =>
                        handleProductDetails(
                          product
                        )
                      }
                    >
                      View Product Details →
                    </button>

                  </div>
                </article>
              )
            )}

          </div>
        )}

      </main>


      {/* FEATURES */}

     
<section className="features-section">

  <button
    className="feature-card feature-delivery"
    onClick={() => {
      setShowCart(false);
      setShowWishlist(false);
      setProductDetails(null);

      if (loggedIn) {
        setShowOrders(true);
      } else {
        alert("My Orders dekhne ke liye pehle login karein.");
      }
    }}
  >
    <span>🚚</span>
    <div>
      <h3>Fast Delivery</h3>
      <p>Quick and reliable delivery experience.</p>
      <small>View My Orders →</small>
    </div>
  </button>

  <button
    className="feature-card feature-security"
    onClick={() => {
      setShowOrders(false);
      setShowWishlist(false);
      setProductDetails(null);
      setShowCart(true);
    }}
  >
    <span>🔒</span>
    <div>
      <h3>Secure Shopping</h3>
      <p>Protected and smooth shopping experience.</p>
      <small>Go To Cart →</small>
    </div>
  </button>

  <button
    className="feature-card feature-premium"
    onClick={() => {
      setShowOrders(false);
      setShowCart(false);
      setShowWishlist(false);
      setProductDetails(null);

      setTimeout(() => {
        document
          .getElementById("products")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    }}
  >
    <span>💎</span>
    <div>
      <h3>Premium Products</h3>
      <p>Fresh products directly from Admin.</p>
      <small>Explore Products →</small>
    </div>
  </button>

  <button
    className="feature-card feature-customer"
    onClick={() => {
      setShowOrders(false);
      setShowCart(false);
      setProductDetails(null);
      setShowWishlist(true);
    }}
  >
    <span>❤️</span>
    <div>
      <h3>Customer First</h3>
      <p>Designed for easy everyday shopping.</p>
      <small>Open Wishlist →</small>
    </div>
  </button>

</section>

{showAnamikaProfile && (
  <div
    className="profile-overlay"
    onClick={() => setShowAnamikaProfile(false)}
  >
    <div
      className="profile-card"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="profile-close"
        onClick={() => setShowAnamikaProfile(false)}
        aria-label="Close profile"
      >
        ×
      </button>

      <img
        src="/anamika.jpeg"
        alt="Anamika Maurya"
        className="profile-photo"
      />

      <h2>Anamika Maurya</h2>
      <p>ShopEasy Profile</p>
    </div>
  </div>
)}


      {/* FOOTER */}

<footer className="premium-footer">

  <div className="footer-glow"></div>

  <div className="footer-container">

    <div className="footer-brand">
      <div className="footer-logo">
        <span>🛍️</span>
        <strong>ShopEasy</strong>
      </div>

      <span className="footer-badge">
        ✦ Premium Shopping
      </span>

      <p>
        Your modern destination for everyday shopping.
        <br />
        Quality products. Easy shopping. Happy customers.
      </p>
    </div>

    <div className="footer-links">
      <h4>ShopEasy</h4>

      <button
        onClick={() =>
          document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
          })
        }
      >
        Explore Products
      </button>

      <button
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        Back To Top ↑
      </button>
    </div>

    <div className="footer-trust">
      <h4>Why ShopEasy?</h4>

      <span>🚚 Fast Delivery</span>
      <span>🔒 Secure Shopping</span>
      <span>💎 Premium Products</span>
    </div>

  </div>

  <div className="footer-divider"></div>

  <div className="footer-bottom">

    <p>
      © 2026 <strong>ShopEasy</strong>. All rights reserved.
    </p>

    <div className="footer-status">
      <span className="status-dot"></span>
      <span>Online & Ready to Shop</span>
    </div>

  </div>

</footer>


      {/* LOGIN MODAL */}
      {showLogin && !loggedIn && (
        <div
          className="auth-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogin(false);
            }
          }}
        >
          <div
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Login to ShopEasy"
          >
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setShowLogin(false)}
              aria-label="Close login"
            >
              ×
            </button>

            <LoginForm
              onClose={() => setShowLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}

      {/* REGISTER */}

      {showRegister &&
        !loggedIn && (
          <RegisterForm
            onClose={() =>
              setShowRegister(
                false
              )
            }
            onRegisterSuccess={
              handleRegisterSuccess
            }
          />
        )}

    </div>
  );
}

export default App;

