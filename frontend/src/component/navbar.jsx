
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({
  cartCount = 0,
  wishlistCount = 0,
  user,
}) {
  const [search, setSearch] = useState("");
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();

    const query = search.trim();
    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setShopOpen(false);
  }

  return (
    <header className="se-header">
      <div className="se-topbar">
        <span>🚚 Free shipping on orders over ₹999</span>
        <span>Track Order &nbsp; | &nbsp; Customer Support</span>
      </div>

      <div className="se-navbar">
        <Link to="/" className="se-brand">
          <span className="se-brand-name">
            Shop<span>Easy</span>
          </span>
          <small>BETTER CHOICES. BRIGHTER LIFE.</small>
        </Link>

        <nav className="se-navigation">
          <Link to="/" className="se-nav-link">Home</Link>

          <div className="se-menu-wrap">
            <button
              type="button"
              className="se-nav-link se-nav-button"
              onClick={() => setShopOpen(!shopOpen)}
              aria-expanded={shopOpen}
            >
              Shop⌄
            </button>

            {shopOpen && (
              <div className="se-dropdown">
                <Link to="/shop" onClick={() => setShopOpen(false)}>
                  All Products
                </Link>
                <Link to="/collections" onClick={() => setShopOpen(false)}>
                  Collections
                </Link>
                <Link to="/discover" onClick={() => setShopOpen(false)}>
                  Discover
                </Link>
              </div>
            )}
          </div>

          <Link to="/collections" className="se-nav-link">
            Collections
          </Link>
          <Link to="/discover" className="se-nav-link">
            Discover
          </Link>
        </nav>

        <form className="se-search" onSubmit={handleSearch}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands and more..."
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <div className="se-actions">
          <Link to="/wishlist" className="se-icon-link" aria-label="Wishlist">
            ♡
            {wishlistCount > 0 && (
              <span className="se-count">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="se-icon-link" aria-label="Cart">
            🛒
            {cartCount > 0 && (
              <span className="se-count">{cartCount}</span>
            )}
          </Link>

          <div className="se-menu-wrap">
            <button
              type="button"
              className="se-account"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen}
            >
              <span className="se-avatar">♙</span>
              <span>{user?.name || "Account"}</span>
              <span>⌄</span>
            </button>

            {accountOpen && (
              <div className="se-dropdown se-account-menu">
                <Link to="/account" onClick={() => setAccountOpen(false)}>
                  My Account
                </Link>
                <Link to="/orders" onClick={() => setAccountOpen(false)}>
                  My Orders
                </Link>
                <Link to="/wishlist" onClick={() => setAccountOpen(false)}>
                  Wishlist
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="se-admin-actions">
          <Link to="/admin" className="se-admin-btn">
            ▦ <span>Admin Dashboard</span>
          </Link>
          <Link to="/admin/orders" className="se-admin-btn">
            ▤ <span>Admin Orders</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
