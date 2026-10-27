import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(
    localStorage.getItem(
      "shopeasyTheme"
    ) === "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme =
      dark ? "dark" : "light";

    localStorage.setItem(
      "shopeasyTheme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      onClick={() =>
        setDark((prev) => !prev)
      }
      aria-label="Toggle theme"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;