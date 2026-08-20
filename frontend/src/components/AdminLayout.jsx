import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function AdminLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-slate-900" : "bg-white"} transition-colors duration-300`}>

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        {/* TOP HEADER */}
        <header className={`h-14 flex items-center justify-end px-6 border-b ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"} transition-colors duration-300`}>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 p-8 overflow-y-auto ${isDark ? "bg-slate-900 text-white" : "bg-white text-gray-900"} transition-colors duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}






