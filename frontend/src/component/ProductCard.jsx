function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />

        {product.discount && (
          <span className="discount">
            {product.discount}% OFF
          </span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <div className="rating">
          ⭐ {product.rating}
        </div>

        <div className="price-row">
          <div>
            <strong>₹{product.price}</strong>

            {product.oldPrice && (
              <del>₹{product.oldPrice}</del>
            )}
          </div>

          <button onClick={() => addToCart(product)}>
            Add +
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;