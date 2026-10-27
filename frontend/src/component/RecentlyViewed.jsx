const RecentlyViewed = ({
  products,
  onProductClick,
}) => {
  let ids = [];

  try {
    ids = JSON.parse(
      localStorage.getItem(
        "shopeasyRecentlyViewed"
      ) || "[]"
    );
  } catch {
    ids = [];
  }

  const recent = ids
    .map((id) =>
      products.find(
        (product) =>
          product._id === id
      )
    )
    .filter(Boolean)
    .slice(0, 6);

  if (!recent.length) {
    return null;
  }

  return (
    <section className="recent-section">

      <div className="section-heading">
        <span>
          BACK TO YOUR PICKS
        </span>

        <h2>Recently Viewed</h2>
      </div>

      <div className="recent-grid">

        {recent.map((item) => (
          <button
            className="recent-card"
            key={item._id}
            onClick={() =>
              onProductClick(item)
            }
          >
            <img
              src={item.image}
              alt={item.name}
            />

            <div>
              <h3>{item.name}</h3>

              <strong>
                ₹{item.price}
              </strong>
            </div>
          </button>
        ))}

      </div>
    </section>
  );
};

export default RecentlyViewed;