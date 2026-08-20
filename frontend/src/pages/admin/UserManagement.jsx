import { useState, useContext, useEffect, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  getAdminActivity,
} from "../../services/api";

/** Turn an ISO timestamp into "5 mins ago" / "2 hours ago" / a date. */
function timeAgo(iso) {
  if (!iso) return "Never";
  const then = new Date(iso);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString();
}

export default function UserManagement() {
  const { theme } = useContext(ThemeContext);
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionModal, setActionModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /** Load users and the activity feed together. */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [userResponse, activityResponse] = await Promise.all([
        getAdminUsers(),
        getAdminActivity(20),
      ]);

      setUsers(
        userResponse.users.map((user) => ({
          id: user._id,
          name: user.username || "Unknown",
          email: user.email || "",
          role: user.role || "user",
          status: user.is_active === false ? "Inactive" : "Active",
          joinDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "N/A",
          callsAnalyzed: user.calls_analyzed ?? 0,
          lastActive: timeAgo(user.last_active),
          avatar: "👤",
        }))
      );

      setActivity(activityResponse || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(
        err.response?.data?.error ||
          "Could not load user data. Check that you are signed in as an administrator."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 border-green-400 text-green-700";
      case "Inactive":
        return "bg-gray-50 text-gray-800 border-gray-400";
      default:
        return "bg-yellow-500/20 border-yellow-400 text-yellow-700";
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActionModal("editRole");
  };

  /** Persist the role change, then refresh from the server. */
  const handleSaveRole = async () => {
    try {
      setSaving(true);
      await updateUserRole(selectedUser.id, newRole);
      showSuccess(`${selectedUser.name}'s role updated to ${newRole}`);
      setActionModal(null);
      await loadData();
    } catch (err) {
      console.error("Failed to update role:", err);
      showSuccess(
        err.response?.data?.error || "Could not update role. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewAnalytics = (user) => {
    setSelectedUser(user);
    setActionModal("analytics");
  };

  /** Persist the status change, then refresh from the server. */
  const handleToggleStatus = async (user) => {
    const makeActive = user.status !== "Active";
    try {
      await updateUserStatus(user.id, makeActive);
      showSuccess(
        `${user.name} has been ${makeActive ? "activated" : "deactivated"}`
      );
      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
      showSuccess(
        err.response?.data?.error || "Could not update status. Please try again."
      );
    }
  };

  const avgCalls = users.length
    ? Math.round(
        users.reduce((sum, u) => sum + u.callsAnalyzed, 0) / users.length
      )
    : 0;

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="ml-4 text-gray-600">Loading users...</p>
        </div>
      )}

      {error && !loading && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-700 text-sm">Total Users</p>
          <h3 className="text-2xl font-bold text-violet-700">{users.length}</h3>
        </div>
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-700 text-sm">Active Users</p>
          <h3 className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === "Active").length}
          </h3>
        </div>
        <div className="rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-700 text-sm">Avg Calls per User</p>
          <h3 className="text-2xl font-bold text-purple-700">{avgCalls}</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  isDark
                    ? "bg-slate-800 text-gray-100 border-slate-700"
                    : "border-gray-200 bg-gray-50 text-gray-900"
                }`}
              >
                <th className="text-left px-6 py-4 font-bold">User</th>
                <th className="text-left px-6 py-4 font-bold">Role</th>
                <th className="text-left px-6 py-4 font-bold">Status</th>
                <th className="text-left px-6 py-4 font-bold">Calls</th>
                <th className="text-left px-6 py-4 font-bold">Last Active</th>
                <th className="text-left px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b transition ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-gray-100"
                      : "border-gray-100 hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          {user.name}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 border border-purple-400 text-purple-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 font-medium ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {user.callsAnalyzed}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditRole(user)}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-500/30 transition text-sm font-medium"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(user)}
                        className="px-3 py-1 bg-violet-500/20 border border-violet-400 text-violet-700 rounded-lg hover:bg-violet-500/30 transition text-sm font-medium"
                      >
                        Analytics
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="px-3 py-1 bg-yellow-500/20 border border-yellow-400 text-yellow-700 rounded-lg hover:bg-yellow-500/30 transition text-sm font-medium"
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Log — real events from the admin_logs collection */}
      <div className="mt-8 rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Recent Activity Log
          </h4>
          <button
            onClick={loadData}
            className="text-sm text-violet-700 hover:text-violet-900 font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activity.length === 0 && (
            <p className="text-gray-500 text-sm py-4">
              No activity recorded yet. Role and status changes will appear here.
            </p>
          )}

          {activity.map((entry) => (
            <div
              key={entry._id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <span className="text-violet-700 mt-1">{entry.icon || "•"}</span>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{entry.message}</p>
                <p className="text-gray-500 text-xs">
                  {timeAgo(entry.timestamp)}
                  {entry.actor_email ? ` · by ${entry.actor_email}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success / error toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-500/20 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-sm z-40">
          {successMessage}
        </div>
      )}

      {/* Edit Role Modal */}
      {actionModal === "editRole" && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Edit User Role
            </h3>
            <p className="text-gray-700 mb-6">
              Change role for{" "}
              <span className="text-violet-700 font-semibold">
                {selectedUser.name}
              </span>
            </p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleSaveRole}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 border border-green-500 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-400 text-red-700 font-semibold rounded-lg hover:bg-red-500/30 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Analytics Modal */}
      {actionModal === "analytics" && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              User Analytics
            </h3>
            <p className="text-gray-700 mb-6">
              Analytics for{" "}
              <span className="text-violet-700 font-semibold">
                {selectedUser.name}
              </span>
            </p>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Total Calls Analyzed</p>
                <h4 className="text-2xl font-bold text-violet-700">
                  {selectedUser.callsAnalyzed}
                </h4>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Last Active</p>
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedUser.lastActive}
                </h4>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm">Member Since</p>
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedUser.joinDate}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setActionModal(null)}
              className="w-full px-4 py-2 bg-purple-600 border border-purple-500 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}