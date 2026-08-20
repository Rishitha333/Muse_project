import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { getAllUsers } from "../../services/api";

export default function UserManagement() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const transformed = response.users.map((user) => ({
        id: user._id,
        name: user.username || "Unknown",
        email: user.email || "",
        role: user.role || "user",
        status: user.is_active === false ? "Inactive" : "Active",
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A",
        callsAnalyzed: user.calls_analyzed || 0,
        lastActive: user.last_active || "N/A",
        avatar: "👤",
      }));
      setUsers(transformed);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);

  const [expandedUser, setExpandedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 border-green-400 text-green-700";
      case "Inactive":
        return "bg-gray-50 text-gray-800 border-gray-400 text-gray-700";
      default:
        return "bg-yellow-500/20 border-yellow-400 text-yellow-700";
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActionModal("editRole");
  };

  const handleSaveRole = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
    showSuccess(`${selectedUser.name}'s role updated to ${newRole}`);
    setActionModal(null);
  };

  const handleViewAnalytics = (user) => {
    setSelectedUser(user);
    setActionModal("analytics");
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    showSuccess(`${user.name} has been ${newStatus.toLowerCase()}`);
  };



  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div>
      {loading && (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    <p className="ml-4 text-gray-600">Loading users...</p>
  </div>
)}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          User Management
        </h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm" >
          <p className="text-gray-700400 text-sm">Total Users</p>
          <h3 className="text-2xl font-bold text-violet-700">{users.length}</h3>
        </div>
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm" >
          <p className="text-gray-700400 text-sm">Active Users</p>
          <h3 className="text-2xl font-bold text-green-">{users.filter(u => u.status === "Active").length}</h3>
        </div>
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm" >
          <p className="text-gray-700400 text-sm">Avg Calls per User</p>
          <h3 className="text-2xl font-bold text-purple-">
            {Math.round(users.reduce((sum, u) => sum + u.callsAnalyzed, 0) / users.length)}
          </h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden" >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-800 text-gray-100 border-slate-700" : "border-gray-200 bg-gray-50 text-gray-900"}`}>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>User</th>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Role</th>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Status</th>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Calls</th>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Last Active</th>
                <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  <tr key={`user-${user.id}`} className={`border-b transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-gray-100" : "border-gray-100 hover:bg-gray-50 text-gray-800"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <p className={`font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}>{user.name}</p>
                          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 border border-purple-400 text-purple-">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}>{user.callsAnalyzed}</td>
                    <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{user.lastActive}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        className={`font-medium text-sm transition ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-violet-700 hover:text-cyan-200"}`}
                      >
                        {expandedUser === user.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <tr key={`expand-${user.id}`} className={`border-b ${isDark ? "bg-slate-800 text-gray-100 border-slate-700" : "bg-gray-50 text-gray-800 border-gray-100"}`}>
                      <td colSpan="6" className="px-6 py-6">
                        <div>
                          {/* Actions */}
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">User Actions</h4>
                            <div className="space-y-2 flex flex-col">
                              <button 
                                onClick={() => handleEditRole(user)}
                                className="px-4 py-2 bg-purple-500/30 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-500/40 transition text-sm font-medium"
                              >
                                Edit Role
                              </button>
                              <button 
                                onClick={() => handleViewAnalytics(user)}
                                className="px-4 py-2 bg-purple-500/30 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-500/40 transition text-sm font-medium"
                              >
                                View Analytics
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(user)}
                                className="px-4 py-2 bg-yellow-500/30 border border-yellow-400 text-yellow- rounded-lg hover:bg-yellow-500/40 transition text-sm font-medium"
                              >
                                {user.status === "Active" ? "Deactivate" : "Activate"}
                              </button>
                            </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="mt-8 rounded-xl p-6 border border-gray-200 shadow-sm" >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Log</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-violet-700 mt-1">↓</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Aarthi logged in</p>
              <p className="text-gray-900/60400 text-xs">2 mins ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-purple-700 mt-1">⚙</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Priya's role changed to Analyst</p>
              <p className="text-gray-900/60400 text-xs">15 mins ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-yellow- mt-1">🔑</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Password reset link sent to meena@example.com</p>
              <p className="text-gray-900/60400 text-xs">45 mins ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-green-700 mt-1">✓</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Ravi's account activated</p>
              <p className="text-gray-900/60400 text-xs">1 hour ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-red-700 mt-1">✕</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Vikram's account deactivated</p>
              <p className="text-gray-900/60400 text-xs">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
            <span className="text-purple-700 mt-1">➕</span>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">New user registered: Vikram</p>
              <p className="text-gray-900/60400 text-xs">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-500/20 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-sm animate-pulse z-40">
          ✓ {successMessage}
        </div>
      )}

      {/* Edit Role Modal */}
      {actionModal === "editRole" && selectedUser && (
        <div className="fixed inset-0 bg-black/50 shadow-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white" >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Edit User Role</h3>
            <p className="text-gray-700 mb-6">Change role for <span className="text-violet-700 font-semibold">{selectedUser.name}</span></p>
            
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 border border-gray-300 text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option className="text-black" value="Admin">Admin</option>
              <option className="text-black" value="Analyst">Analyst</option>
              <option className="text-black" value="Viewer">Viewer</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleSaveRole}
                className="flex-1 px-4 py-2 bg-green-500 border border-green-400 text-white font-semibold rounded-lg hover:bg-green-600 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-2 bg-red-500/30 border border-red-400 text-red-700 font-semibold rounded-lg hover:bg-red-500/40 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Analytics Modal */}
      {actionModal === "analytics" && selectedUser && (
        <div className="fixed inset-0 bg-black/50 shadow-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white" >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">User Analytics</h3>
            <p className="text-gray-700 mb-6">Analytics for <span className="text-violet-700 font-semibold">{selectedUser.name}</span></p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Total Calls Analyzed</p>
                <h4 className="text-2xl font-bold text-violet-700">{selectedUser.callsAnalyzed}</h4>
              </div>
              <div className="p-4 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Average Calls per Day</p>
                <h4 className="text-2xl font-bold text-purple-">{Math.round(selectedUser.callsAnalyzed / 30)}</h4>
              </div>
              <div className="p-4 bg-gray-50 text-gray-800 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Member Since</p>
                <h4 className="text-lg font-semibold text-gray-900">{selectedUser.joinDate}</h4>
              </div>
            </div>

            <button
              onClick={() => setActionModal(null)}
              className="w-full px-4 py-2 bg-purple-500 border border-purple-400 text-white font-semibold rounded-lg hover:bg-purple-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
}












