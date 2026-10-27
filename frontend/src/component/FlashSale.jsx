import { useEffect, useState } from "react";

const FlashSale = ({
  products,
  onProductClick,
}) => {
  const [timeLeft, setTimeLeft] =
    useState(6 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev <= 0
          ? 6 * 60 * 60
          : prev - 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const saleProducts = products
    .filter(
      (item) =>
        Number(item.oldPrice || 0) >
        Number(item.price || 0)
    )
    .slice(0, 4);

  if (!saleProducts.length) {
    return null;
  }

  const hours = String(
    Math.floor(timeLeft / 3600)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor(
      (timeLeft % 3600) / 60
    )
  ).padStart(2, "0");

  const seconds = String(
    timeLeft % 60
  ).padStart(2, "0");

  return (
    <section className="flash-sale-section">

      <div className="flash-header">

        <div>
          <span>
            LIMITED TIME
          </span>

          <h2>⚡ Flash Sale</h2>

          <p>
            Premium deals before they
            disappear.
          </p>
        </div>

        <div className="sale-countdown">

          <small>ENDS IN</small>

          <div className="countdown-boxes">
            <b>{hours}</b>
            <i>:</i>
            <b>{minutes}</b>
            <i>:</i>
            <b>{seconds}</b>
          </div>

        </div>

      </div>

      <div className="flash-grid">

        {saleProducts.map((item) => {
          const discount = Math.round(
            ((item.oldPrice -
              item.price) /
              item.oldPrice) *
              100
          );

          return (
            <button
              className="flash-card"
              key={item._id}
              onClick={() =>
                onProductClick(item)
              }
            >
              <div className="flash-badge">
                -{discount}%
              </div>

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="flash-info">

                <span>
                  {item.category}
                </span>

                <h3>{item.name}</h3>

                <strong>
                  ₹{item.price}
                </strong>

                <del>
                  ₹{item.oldPrice}
                </del>

              </div>
            </button>
          );
        })}

      </div>
    </section>
  );
};

export default FlashSale;