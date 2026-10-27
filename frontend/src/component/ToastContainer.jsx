import { useEffect, useState } from "react";

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const id = Date.now();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message:
            event.detail?.message ||
            "Done successfully",
          type:
            event.detail?.type || "success",
        },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter(
            (item) => item.id !== id
          )
        );
      }, 3200);
    };

    window.addEventListener(
      "shopeasy:toast",
      handleToast
    );

    return () => {
      window.removeEventListener(
        "shopeasy:toast",
        handleToast
      );
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`premium-toast ${toast.type}`}
        >
          <span className="toast-icon">
            {toast.type === "error"
              ? "!"
              : "✓"}
          </span>

          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;


