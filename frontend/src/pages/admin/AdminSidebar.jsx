import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">

      <div className="p-6 flex justify-center">
        <Logo size="md" />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => navigate("/admin")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-">
          Dashboard
        </button>
        <button onClick={() => navigate("/admin/users")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-">
          User Management
        </button>
        <button onClick={() => navigate("/admin/settings")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-">
          System Settings
        </button>
      </nav>

      <div className="p-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("currentCallId");
            navigate("/login");
          }}
          className="w-full bg-red-600 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}










