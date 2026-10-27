
const MobileBottomNav = ({
  onHome,
  onCart,
  onWishlist,
  onOrders,
  onAccount,
  cartCount,
  loggedIn,
}) => {
  return (
    <nav className="mobile-bottom-nav">

      <button onClick={onHome}>
        <span>⌂</span>
        <small>Home</small>
      </button>

      <button onClick={onWishlist}>
        <span>♡</span>
        <small>Wishlist</small>
      </button>

      <button
        className="mobile-cart-btn"
        onClick={onCart}
      >
        <span>🛒</span>

        {cartCount > 0 && (
          <b>{cartCount}</b>
        )}

        <small>Cart</small>
      </button>

      <button
        onClick={
          loggedIn
            ? onOrders
            : onAccount
        }
      >
        <span>📦</span>

        <small>
          {loggedIn
            ? "Orders"
            : "Login"}
        </small>
      </button>

      <button onClick={onAccount}>
        <span>👤</span>
        <small>Account</small>
      </button>

    </nav>
  );
};

export default MobileBottomNav;