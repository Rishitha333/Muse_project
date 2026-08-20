import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className={`flex-1 p-8 min-h-screen ${isDark ? "bg-slate-900 text-gray-100" : "bg-gray-100 text-gray-800"}`}>
        {children}
      </main>
    </div>
  );
}











