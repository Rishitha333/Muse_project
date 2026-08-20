import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* PAGE CONTENT */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto relative bg-white text-gray-900">
        <Outlet />
      </main>
    </div>
  );
}







