import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, changeTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 sm:p-3 text-lg sm:text-xl rounded-full transition duration-200 border-2 border-white"
      title="Toggle Theme"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}







