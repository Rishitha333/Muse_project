import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <aside className="w-64 min-h-screen flex flex-col transition-colors duration-300" style={{
      background: isDark
        ? "linear-gradient(180deg, rgba(31,41,55,0.95) 0%, rgba(17,21,28,0.95) 100%)"
        : "linear-gradient(180deg, rgba(91,47,214,0.8) 0%, rgba(124,58,237,0.8) 100%)",
      color: isDark ? "#e5e7eb" : "white",
    }}>

      {/* LOGO */}
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
        <Logo size="sm" theme="dark" />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => navigate("/admin")}
          className={`block w-full text-left px-4 py-2 rounded transition ${
            isDark
              ? 'hover:bg-white/10 text-gray-200'
              : 'hover:bg-white/20 text-white'
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className={`block w-full text-left px-4 py-2 rounded transition ${
            isDark
              ? 'hover:bg-white/10 text-gray-200'
              : 'hover:bg-white/20 text-white'
          }`}
        >
          User Management
        </button>

        <button
          onClick={() => navigate("/admin/calls")}
          className={`block w-full text-left px-4 py-2 rounded transition ${
            isDark
              ? 'hover:bg-white/10 text-gray-200'
              : 'hover:bg-white/20 text-white'
          }`}
        >
          Call Records
        </button>

        <button
          onClick={() => navigate("/admin/reports")}
          className={`block w-full text-left px-4 py-2 rounded transition ${
            isDark
              ? 'hover:bg-white/10 text-gray-200'
              : 'hover:bg-white/20 text-white'
          }`}
        >
          Reports & Analytics
        </button>

        <button
          onClick={() => navigate("/admin/settings")}
          className={`block w-full text-left px-4 py-2 rounded transition ${
            isDark
              ? 'hover:bg-white/10 text-gray-200'
              : 'hover:bg-white/20 text-white'
          }`}
        >
          System Settings
        </button>
      </nav>

      {/* LOGOUT */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
        <button
          onClick={() => navigate("/login")}
          className={`w-full py-2 rounded transition font-semibold ${
            isDark
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}






