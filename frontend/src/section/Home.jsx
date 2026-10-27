import { useState } from "react";

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Aesthetic Traditional yet Modern Mock Data curated for 'ApnaBazar'
  const [products] = useState([
    {
      id: 1,
      name: "Handcrafted Tan Leather Wallet",
      price: "₹3,499",
      category: "accessories",
      img: "💼",
    },
    {
      id: 2,
      name: "Minimalist Ceramic Chai Kulhad",
      price: "₹1,240",
      category: "lifestyle",
      img: "☕",
    },
    {
      id: 3,
      name: "Mystic Oud & Amber Fragrance",
      price: "₹7,999",
      category: "luxury",
      img: "✨",
    },
  ]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const styles = {
    section: {
      backgroundColor: "#0a0a0a",
      minHeight: "calc(100vh - 75px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 40px",
      position: "relative",
      overflow: "hidden",
      // Clean modern blueprint grid background
      backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)`,
      backgroundSize: "50px 50px",
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    },
    container: {
      maxWidth: "1200px",
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1.2fr 0.8fr",
      gap: "60px",
      alignItems: "center",
      zIndex: 2,
    },
    leftContent: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    badge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(214, 175, 55, 0.08)",
      border: "1px solid rgba(214, 175, 55, 0.25)",
      color: "#d4af37",
      padding: "6px 18px",
      borderRadius: "100px",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
    },
    heading: {
      fontSize: "64px",
      fontWeight: "800",
      color: "#ffffff",
      lineHeight: "1.15",
      margin: 0,
      letterSpacing: "-1px",
    },
    highlight: {
      color: "#d4af37",
      position: "relative",
    },
    description: {
      fontSize: "18px",
      color: "#a3a3a3",
      lineHeight: "1.7",
      margin: 0,
      maxWidth: "540px",
      fontWeight: "400",
    },
    categoryTabs: {
      display: "flex",
      gap: "12px",
      marginTop: "12px",
    },
    tabBtn: (active) => ({
      padding: "10px 22px",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "100px",
      border: active ? "1px solid #d4af37" : "1px solid #262626",
      backgroundColor: active ? "#d4af37" : "transparent",
      color: active ? "#000000" : "#a3a3a3",
      cursor: "pointer",
      textTransform: "capitalize",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    }),
    rightContent: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      alignItems: "stretch",
    },
    cartStatus: {
      alignSelf: "flex-end",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      backgroundColor: "#171717",
      padding: "10px 20px",
      borderRadius: "100px",
      border: "1px solid #262626",
      display: "flex",
      gap: "8px",
      alignItems: "center",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    },
    productsGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "18px",
    },
    productCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px",
      borderRadius: "20px",
      background: "linear-gradient(180deg, #171717 0%, #121212 100%)",
      border: "1px solid #262626",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      cursor: "pointer",
    },
    prodLeft: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    imgFallback: {
      width: "56px",
      height: "56px",
      backgroundColor: "rgba(214, 175, 55, 0.05)",
      border: "1px solid rgba(214, 175, 55, 0.15)",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    },
    prodInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    prodName: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "16px",
      letterSpacing: "-0.2px",
    },
    prodPrice: {
      color: "#d4af37",
      fontSize: "15px",
      fontWeight: "700",
    },
    buyBtn: {
      padding: "10px 20px",
      backgroundColor: "transparent",
      border: "1px solid #d4af37",
      borderRadius: "100px",
      color: "#d4af37",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    glowEffect: {
      position: "absolute",
      width: "500px",
      height: "500px",
      borderRadius: "50%",
      backgroundColor: "rgba(214, 175, 55, 0.05)",
      filter: "blur(120px)",
      top: "15%",
      right: "-5%",
      zIndex: 1,
    },
    glowEffectLeft: {
      position: "absolute",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      filter: "blur(100px)",
      bottom: "-10%",
      left: "-5%",
      zIndex: 1,
    },
  };

  return (
    <section id="home" style={styles.section}>
      <div style={styles.glowEffect} />
      <div style={styles.glowEffectLeft} />

      <div style={styles.container}>
        {/* Left Side: Brand Story & Navigation */}
        <div style={styles.leftContent}>
          <div style={styles.badge}>Discover Local Luxury</div>
          <h1 style={styles.heading}>
            Welcome to <br />
            <span style={styles.highlight}>ApnaBazar</span>.
          </h1>
          <p style={styles.description}>
            A showcase portfolio demonstrating high-end digital craftsmanship. 
            Explore an ultra-minimalist marketplace interface designed for seamless engagement.
          </p>

          {/* Luxury Categories */}
          <div style={styles.categoryTabs}>
            {["all", "accessories", "lifestyle", "luxury"].map((cat) => (
              <button
                key={cat}
                style={styles.tabBtn(selectedCategory === cat)}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Showcase Shelf Layout */}
        <div style={styles.rightContent}>
          <div style={styles.cartStatus}>
            🛒 Showcase Cart: <strong>{cartCount} Items</strong>
          </div>

          {/* Product Items Display Container */}
          <div style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={styles.productCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(214, 175, 55, 0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#262626";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={styles.prodLeft}>
                  <div style={styles.imgFallback}>{product.img}</div>
                  <div style={styles.prodInfo}>
                    <span style={styles.prodName}>{product.name}</span>
                    <span style={styles.prodPrice}>{product.price}</span>
                  </div>
                </div>

                <button
                  style={styles.buyBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#d4af37";
                    e.currentTarget.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#d4af37";
                  }}
                  onClick={() => setCartCount((prev) => prev + 1)}
                >
                  Add +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
