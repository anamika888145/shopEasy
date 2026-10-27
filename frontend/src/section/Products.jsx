import React, { useState, useEffect } from 'react';

const Products = ({ cart, addToCart, handleBuyNow, updateQuantity, removeFromCart, cartTotal, isCartOpen, setIsCartOpen }) => {
  // 📦 API data aur async network lifecycle states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");  

  // 🌐 Live API Data Fetching Lifecycle
  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load products from FakeStoreAPI");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 🏷️ Fetched live items ke basis par categories list build karna
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // 🔍 Filter Logic (API fields mapping: product.title)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ⏳ Data Loading Screen State
  if (loading) {
    return (
      <div style={{ ...styles.pageWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading Premium Products...</h2>
      </div>
    );
  }

  // ❌ Fetch Error Handling View
  if (error) {
    return (
      <div style={{ ...styles.pageWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#ff4a4a' }}>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Controls */}
        <div style={styles.controls}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            style={styles.selectInput}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat} style={styles.optionStyle}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div style={styles.grid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} style={styles.card}>
                {/* 🖼️ Clean container box for balancing external white backgrounds */}
                <div style={styles.imageContainer}>
                  <img src={product.image} alt={product.title} style={styles.image} />
                </div>
                <div style={styles.cardBody}>
                  <span style={styles.categoryBadge}>{product.category}</span>
                  <h3 style={styles.productName}>{product.title}</h3>
                  <p style={styles.description}>{product.description}</p>
                  <div style={styles.footer}>
                    {/* 💸 Price multiplying factor to show numeric INR scaling approximation */}
                    <span style={styles.price}>₹{Math.round(product.price * 85)}</span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => addToCart(product)} style={styles.button}>
                        Cart+
                      </button>
                      <button onClick={() => handleBuyNow(product)} style={styles.buyNowBtn}>
                        Buy Now
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.noProducts}>No products found.</p>
          )}
        </div>
      </div>

      {/* ================= PREMIUM SIDE CART DRAWER ================= */}
      {isCartOpen && (
        <div style={styles.drawerOverlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h2>Your Premium Cart</h2>
              <button style={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {cart.length === 0 ? (
                <p style={styles.emptyCartText}>Your cart is currently empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={styles.cartItem}>
                    <img src={item.image} alt={item.title} style={styles.cartItemImg} />
                    <div style={styles.cartItemDetails}>
                      <h4>{item.title}</h4>
                      <p>₹{Math.round(item.price * 85)}</p>
                      <div style={styles.qtyControls}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={styles.deleteBtn}>🗑️</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={styles.drawerFooter}>
                <div style={styles.totalRow}>
                  <span>Total Amount:</span>
                  <span style={styles.totalPrice}>₹{cartTotal}</span>
                </div>
                <button style={styles.checkoutBtn} onClick={() => alert("Proceeding to luxury checkout!")}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Layout configurations 
const styles = {
  pageWrapper: { backgroundColor: '#121212', minHeight: '100vh', color: '#E0E0E0', position: 'relative' },
  container: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  controls: { display: 'flex', gap: '15px', marginBottom: '40px', justifyContent: 'center', flexWrap: 'wrap' },
  searchInput: { padding: '12px 20px', width: '300px', borderRadius: '6px', border: '1px solid #3E2723', backgroundColor: '#1E1E1E', color: '#FFF', fontSize: '16px', outline: 'none' },
  selectInput: { padding: '12px 20px', borderRadius: '6px', border: '1px solid #3E2723', backgroundColor: '#1E1E1E', color: '#FFF', fontSize: '16px', cursor: 'pointer', outline: 'none', textTransform: 'capitalize' },
  optionStyle: { textTransform: 'capitalize' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#1E1E1E', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2C2C2C', display: 'flex', flexDirection: 'column' },
  imageContainer: { width: '100%', height: '220px', backgroundColor: '#fff', padding: '15px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  image: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  categoryBadge: { backgroundColor: '#3E2723', color: '#D4AF37', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', alignSelf: 'flex-start', textTransform: 'capitalize' },
  productName: { margin: '10px 0 5px 0', fontSize: '16px', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  description: { fontSize: '13px', color: '#A0A0A0', height: '55px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '15px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  price: { fontSize: '16px', fontWeight: 'bold', color: '#D4AF37' },
  button: { padding: '8px 12px', backgroundColor: 'transparent', color: '#D4AF37', border: '1px solid #D4AF37', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  buyNowBtn: { padding: '8px 14px', backgroundColor: '#D4AF37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 },
  drawerContainer: { position: 'fixed', top: 0, right: 0, width: '350px', height: '100%', backgroundColor: '#1E1E1E', padding: '20px', display: 'flex', flexDirection: 'column', zIndex: 1001 },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2C2C2C', paddingBottom: '15px' },
  closeBtn: { background: 'none', border: 'none', color: '#FFF', fontSize: '20px', cursor: 'pointer' },
  drawerBody: { flexGrow: 1, overflowY: 'auto', padding: '15px 0' },
  emptyCartText: { textAlign: 'center', color: '#A0A0A0', marginTop: '40px' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #2C2C2C' },
  cartItemImg: { width: '50px', height: '50px', objectFit: 'contain', backgroundColor: '#fff', padding: '4px', borderRadius: '4px' },
  cartItemDetails: { flexGrow: 1 },
};

export default Products;