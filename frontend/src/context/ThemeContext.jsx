import { createContext, useState, useContext, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage on initial load
    const saved = localStorage.getItem("theme");
    if (saved !== null) {
      return saved;
    }
    return "light"; // Default to light mode
  });

  useEffect(() => {
    // Apply theme to document
    const html = document.documentElement;
    
    if (theme === "dark") {
      html.classList.add("dark");
      document.body.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)";
    } else if (theme === "light") {
      html.classList.remove("dark");
      document.body.style.background = "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)";
    } else if (theme === "system") {
      // Use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        html.classList.add("dark");
        document.body.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)";
      } else {
        html.classList.remove("dark");
        document.body.style.background = "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)";
      }
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};







