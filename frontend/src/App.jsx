import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { CallProvider } from "./context/CallContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AnalyzeCall from "./pages/AnalyzeCall";
import Results from "./pages/Results";
import History from "./pages/History";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminCallRecords from "./pages/admin/AdminCallRecords";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";

function AppContent() {
  const { theme } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    
    // Apply theme to document
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    // Restore layout setting
    const appSettings = localStorage.getItem("appSettings");
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      html.setAttribute("data-layout", settings.layout || "comfortable");
      
      // Restore font size
      const fontSizeMap = {
        small: "14px",
        medium: "16px",
        large: "18px",
      };
      html.style.fontSize = fontSizeMap[settings.fontSize] || "16px";
    } else {
      html.setAttribute("data-layout", "comfortable");
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Landing />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* DASHBOARD ROUTES */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<AnalyzeCall />} />
          <Route path="results" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="calls" element={<AdminCallRecords />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CallProvider>
        <AppContent />
      </CallProvider>
    </ThemeProvider>
  );
}

export default App;






