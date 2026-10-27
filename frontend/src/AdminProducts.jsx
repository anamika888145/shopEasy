import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  price: "",
  oldPrice: "",
  image: "",
  stock: "",
  rating: "",
};

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const token = localStorage.getItem("token");

  // Release temporary browser preview URLs when they are replaced/unmounted.
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // GET ALL PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Products load nahi ho rahe");
      }

      setProducts(data.products || data || []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // NORMAL FORM INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SELECT IMAGE FROM COMPUTER
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Sirf JPG, PNG ya WEBP image select karein.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image ka size 5 MB se kam hona chahiye.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setSelectedFile(null);
    setImagePreview("");
  };

  // ADD / UPDATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Login token nahi mila. Pehle login karo.");
      return;
    }

    if (!editingId && !selectedFile) {
      alert("Product ki image select karna zaroori hai.");
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;

      const method = editingId ? "PUT" : "POST";

      // FormData is required for uploading an actual image file.
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", String(Number(form.price)));
      formData.append("oldPrice", String(Number(form.oldPrice || 0)));
      formData.append("stock", String(Number(form.stock)));
      formData.append("rating", String(Number(form.rating || 0)));

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (editingId && form.image) {
        // Keep the old image when editing without selecting a replacement.
        formData.append("existingImage", form.image);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type here. Browser adds the multipart boundary.
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product save failed");
      }

      alert(
        editingId
          ? "Product successfully update ho gaya!"
          : "Product successfully add ho gaya!"
      );

      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error("PRODUCT ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setEditingId(product._id);
    setSelectedFile(null);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      image: product.image || "",
      stock: product.stock ?? "",
      rating: product.rating ?? "",
    });

    setImagePreview(getImageUrl(product.image));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (!token) {
      alert("Login token nahi mila.");
      return;
    }

    const confirmDelete = window.confirm(
      "Kya aap ye product delete karna chahte hain?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product delete failed");
      }

      alert("Product delete ho gaya.");
      await fetchProducts();
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>ShopEasy Admin Panel</h1>
        <p>Products manage karein</p>
      </div>

      <div className="admin-form-card">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-input">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Wireless Headphones"
                required
              />
            </div>

            <div className="admin-input">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Electronics"
                required
              />
            </div>

            <div className="admin-input">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="1999"
                min="0"
                required
              />
            </div>

            <div className="admin-input">
              <label>Old Price</label>
              <input
                type="number"
                name="oldPrice"
                value={form.oldPrice}
                onChange={handleChange}
                placeholder="2499"
                min="0"
              />
            </div>

            <div className="admin-input">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="20"
                min="0"
                required
              />
            </div>

            <div className="admin-input">
              <label>Rating</label>
              <input
                type="number"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            {/* IMAGE FILE UPLOAD - NO URL INPUT */}
            <div className="admin-input full-width">
              <label>Product Image</label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                required={!editingId}
              />

              <small>JPG, PNG ya WEBP. Maximum size: 5 MB.</small>

              {imagePreview && (
                <div
                  style={{
                    marginTop: "12px",
                    maxWidth: "320px",
                  }}
                >
                  <p style={{ marginBottom: "8px" }}>Image Preview</p>
                  <img
                    src={imagePreview}
                    alt="Selected product preview"
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: "280px",
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fff",
                    }}
                  />
                  {selectedFile && (
                    <small>
                      Selected: {selectedFile.name}
                    </small>
                  )}
                </div>
              )}
            </div>

            <div className="admin-input full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description"
                rows="4"
                required
              />
            </div>
          </div>

          <div className="admin-buttons">
            <button
              type="submit"
              className="admin-save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-products">
        <h2>All Products</h2>

        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="admin-product-grid">
            {products.map((product) => (
              <div className="admin-product-card" key={product._id}>
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                />

                <div className="admin-product-info">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>

                  <p>
                    ₹
                    {Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <small>Stock: {product.stock}</small>

                  <div className="admin-card-buttons">
                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
