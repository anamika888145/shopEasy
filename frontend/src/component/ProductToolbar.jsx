import React from "react";

const ProductToolbar = ({
  products,
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
}) => {
  const categories = [
    "All",
    ...new Set(
      products
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="premium-toolbar">

      <div className="toolbar-search">
        <span>⌕</span>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search premium products..."
        />

        {search && (
          <button
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      <div className="toolbar-row">

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(e) =>
            setMinRating(
              Number(e.target.value)
            )
          }
        >
          <option value="0">
            All Ratings
          </option>

          <option value="4">
            4★ & above
          </option>

          <option value="4.5">
            4.5★ & above
          </option>

          <option value="4.8">
            4.8★ & above
          </option>
        </select>

        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) =>
            setMinPrice(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(e.target.value)
          }
        />

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <option value="default">
            Sort: Recommended
          </option>

          <option value="low">
            Price: Low to High
          </option>

          <option value="high">
            Price: High to Low
          </option>

          <option value="rating">
            Top Rated
          </option>

          <option value="discount">
            Best Discount
          </option>
        </select>

      </div>
    </div>
  );
};

export default ProductToolbar;
