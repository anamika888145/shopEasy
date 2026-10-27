const RelatedProducts = ({
  currentProduct,
  products,
  onProductClick,
}) => {
  const related = products
    .filter(
      (item) =>
        item._id !== currentProduct?._id &&
        item.category ===
          currentProduct?.category
    )
    .slice(0, 4);

  if (!related.length) {
    return null;
  }

  return (
    <section className="related-section">

      <div className="section-heading">
        <span>CURATED FOR YOU</span>

        <h2>You May Also Like</h2>

        <p>
          More premium picks from the same
          category.
        </p>
      </div>

      <div className="related-grid">

        {related.map((item) => (
          <button
            className="related-card"
            key={item._id}
            onClick={() =>
              onProductClick(item)
            }
          >
            <div className="related-image-wrap">
              <img
                src={item.image}
                alt={item.name}
              />
            </div>

            <div className="related-info">
              <span>
                {item.category}
              </span>

              <h3>{item.name}</h3>

              <div className="related-price">
                ₹{item.price}
              </div>

              <small>
                ★ {item.rating || 0}
              </small>
            </div>
          </button>
        ))}

      </div>
    </section>
  );
};

export default RelatedProducts;