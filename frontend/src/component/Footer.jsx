function Footer() {
  return (
    <footer id="footer">
      <div className="footer-container">
        <div>
          <div className="footer-logo">
            Shop<span>Easy</span>
          </div>

          <p>
            Your one-stop destination for quality products
            at amazing prices.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <a href="#">Home</a>
          <a href="#products">Products</a>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
        </div>

        <div>
          <h3>Customer Service</h3>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>

        <div>
          <h3>Contact</h3>
          <p>📧 support@shopeasy.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 India</p>
        </div>
      </div>

      <div className="copyright">
        © 2026 ShopEasy. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;