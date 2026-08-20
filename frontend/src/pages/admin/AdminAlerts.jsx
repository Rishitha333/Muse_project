import { useState, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function AdminAlerts() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "High Negative Sentiment Spike",
      description: "Detected 45% negative sentiment in the last hour, significantly higher than average.",
      category: "Sentiment",
      timestamp: "2 minutes ago",
      status: "unread",
      priority: "high",
      actionRequired: true,
    },
    {
      id: 2,
      type: "warning",
      title: "System Performance Degradation",
      description: "API response time exceeded threshold. Average response time: 2.3s (normal: 0.8s)",
      category: "Performance",
      timestamp: "15 minutes ago",
      status: "unread",
      priority: "high",
      actionRequired: true,
    },
    {
      id: 3,
      type: "warning",
      title: "Unusual Call Volume Pattern",
      description: "Call volume dropped by 60% compared to same time yesterday. Possible system issue.",
      category: "Operations",
      timestamp: "32 minutes ago",
      status: "read",
      priority: "medium",
      actionRequired: false,
    },
    {
      id: 4,
      type: "info",
      title: "New Language Support Available",
      description: "Marathi language model has been successfully loaded and is ready for use.",
      category: "System",
      timestamp: "1 hour ago",
      status: "read",
      priority: "low",
      actionRequired: false,
    },
    {
      id: 5,
      type: "critical",
      title: "Agent Performance Alert",
      description: "Agent 2 customer satisfaction dropped to 72% (threshold: 85%). Immediate attention needed.",
      category: "Agent",
      timestamp: "1 hour ago",
      status: "unread",
      priority: "high",
      actionRequired: true,
    },
    {
      id: 6,
      type: "warning",
      title: "High Sarcasm Detection Rate",
      description: "Sarcasm detection rate reached 45%, indicating possible training data drift.",
      category: "AI Model",
      timestamp: "2 hours ago",
      status: "read",
      priority: "medium",
      actionRequired: false,
    },
    {
      id: 7,
      type: "info",
      title: "Daily Report Generated",
      description: "Yesterday's analysis report has been generated and is available for download.",
      category: "Reporting",
      timestamp: "3 hours ago",
      status: "read",
      priority: "low",
      actionRequired: false,
    },
    {
      id: 8,
      type: "warning",
      title: "Database Storage Warning",
      description: "Database storage at 85% capacity. Consider archiving old call records.",
      category: "Infrastructure",
      timestamp: "4 hours ago",
      status: "read",
      priority: "medium",
      actionRequired: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const getAlertColor = (type) => {
    switch (type) {
      case "critical":
        return "bg-red-500/20 border-red-400/50 text-red-700";
      case "warning":
        return "bg-orange-500/20 border-orange-400/50 text-orange-700";
      case "info":
        return "bg-purple-500/20 border-purple-400/50 text-purple-700";
      case "success":
        return "bg-green-500/20 border-green-400/50 text-green-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 text-gray-900";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return "🚨";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      default:
        return "📢";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 border-red-400 text-red-700";
      case "medium":
        return "bg-orange-500/20 border-orange-400 text-orange-700";
      case "low":
        return "bg-green-500/20 border-green-400 text-green-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 text-gray-900";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = alerts.filter((a) => a.status === "unread").length;
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const actionRequiredCount = alerts.filter((a) => a.actionRequired).length;

  const markAsRead = (id) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: "read" } : a)));
  };

  const dismissAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const resolveAlert = (id) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, actionRequired: false, status: "read" } : a)));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts & Notifications</h1>
        <p className="text-gray-600">Monitor and manage system alerts and important notifications</p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white" >
          <p className="text-gray-600 text-sm mb-2">Total Alerts</p>
          <h2 className="text-3xl font-bold text-violet-700">{alerts.length}</h2>
        </div>

        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white" >
          <p className="text-gray-600 text-sm mb-2">Unread</p>
          <h2 className="text-3xl font-bold text-purple-700">{unreadCount}</h2>
        </div>

        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white" >
          <p className="text-gray-600 text-sm mb-2">Critical</p>
          <h2 className="text-3xl font-bold text-red-700">{criticalCount}</h2>
        </div>

        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white" >
          <p className="text-gray-600 text-sm mb-2">Action Required</p>
          <h2 className="text-3xl font-bold text-orange-700">{actionRequiredCount}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-6 rounded-xl border border-gray-200 shadow-sm" >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-gray-700400 text-sm block mb-2">Search</label>
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-200 border border-gray-300 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-"
            />
          </div>

          {/* Alert Type Filter */}
          <div>
            <label className="text-gray-700400 text-sm block mb-2">Alert Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-200 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-violet-"
            >
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="all">
                All Types
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="critical">
                Critical
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="warning">
                Warning
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="info">
                Info
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="success">
                Success
              </option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-gray-700400 text-sm block mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-200 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-violet-"
            >
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="all">
                All Status
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="unread">
                Unread
              </option>
              <option style={{ backgroundColor: "#1f2937", color: "#fff" }} value="read">
                Read
              </option>
            </select>
          </div>

          {/* Results */}
          <div>
            <label className="text-gray-700400 text-sm block mb-2">Results</label>
            <div className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 text-gray-">
              {filteredAlerts.length} alerts found
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border shadow-sm transition ${getAlertColor(alert.type)} ${
                alert.status === "unread" ? "ring-2 ring-violet-400/50" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
              }}
            >
              {/* Alert Header */}
              <div
                className={`p-5 cursor-pointer transition ${isDark ? "hover:bg-slate-700 text-gray-100" : "hover:bg-gray-50 text-gray-800"}`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl mt-1">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                          {alert.title}
                          {alert.status === "unread" && (
                            <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                          )}
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{alert.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </span>
                        <span className="text-gray-900/50500 text-xs">{alert.timestamp}</span>
                      </div>
                    </div>

                    {/* Alert Tags */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded text-xs text-gray-">
                        {alert.category}
                      </span>
                      {alert.actionRequired && (
                        <span className="px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-xs text-red-">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xl text-white/40 flex-shrink-0">
                    {expandedAlert === alert.id ? "−" : "+"}
                  </div>
                </div>
              </div>

              {/* Expanded Actions */}
              {expandedAlert === alert.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 text-gray-">
                  <div className="flex gap-3">
                    {alert.status === "unread" && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="px-4 py-2 bg-purple-500/30 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-500/40 transition text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    )}

                    {alert.actionRequired && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-500/30 border border-green-400 text-green-700 rounded-lg hover:bg-green-500/40 transition text-sm font-medium"
                      >
                        Resolve Alert
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-4 py-2 bg-violet-500/30 border border-violet-400 text-violet-700 rounded-lg hover:bg-violet-500/40 transition text-sm font-medium"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-4 py-2 bg-red-500/30 border border-red-400 text-red-700 rounded-lg hover:bg-red-500/40 transition text-sm font-medium ml-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg p-12 text-center border border-gray-200 shadow-sm" >
            <p className="text-gray-700400 text-lg">No alerts match your filters</p>
            <p className="text-gray-900/50500 text-sm mt-2">All quiet! No matching alerts at the moment.</p>
          </div>
        )}
      </div>

      {/* Alert Categories Legend */}
      <div className="mt-12 p-6 rounded-xl border border-gray-200 shadow-sm" >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
            <p className="text-red-700 font-semibold mb-1">🚨 Critical</p>
            <p className="text-gray-700400 text-sm">Requires immediate attention to prevent system issues</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-lg">
            <p className="text-orange-700 font-semibold mb-1">⚠️ Warning</p>
            <p className="text-gray-700400 text-sm">Indicates potential issues that should be reviewed</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
            <p className="text-purple-700 font-semibold mb-1">ℹ️ Info</p>
            <p className="text-gray-700400 text-sm">Informational messages about system events</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
            <p className="text-green-700 font-semibold mb-1">✅ Success</p>
            <p className="text-gray-700400 text-sm">Positive notifications about completed actions</p>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 shadow-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-gray-200 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-4xl mt-1">{getAlertIcon(selectedAlert.type)}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAlert.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAlertColor(selectedAlert.type)}`}>
                      {selectedAlert.type.charAt(0).toUpperCase() + selectedAlert.type.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedAlert.priority)}`}>
                      {selectedAlert.priority.charAt(0).toUpperCase() + selectedAlert.priority.slice(1)} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedAlert.status === "unread" ? "bg-purple-500/20 border-purple-400 text-purple-" : "bg-green-500/20 border-green-400 text-green-"}`}>
                      {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-900/60 hover:text-white transition text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 mb-8">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-gray-700 text-base leading-relaxed">{selectedAlert.description}</p>
              </div>

              {/* Alert Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 text-gray-800 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-900/60 text-xs font-semibold mb-1 uppercase">Category</p>
                  <p className="text-gray-900 font-semibold">{selectedAlert.category}</p>
                </div>
                <div className="bg-gray-50 text-gray-800 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-900/60 text-xs font-semibold mb-1 uppercase">Timestamp</p>
                  <p className="text-gray-900 font-semibold">{selectedAlert.timestamp}</p>
                </div>
              </div>

              {/* Impact Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Risk & Impact</h3>
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <p className="text-red-200 text-sm leading-relaxed">
                    {selectedAlert.type === "critical" && (
                      <>
                        <strong>Critical Risk:</strong> This alert requires immediate action. The identified issue can significantly impact system operations, user experience, or data integrity. Delay in addressing this alert may lead to service degradation or data loss.
                      </>
                    )}
                    {selectedAlert.type === "warning" && (
                      <>
                        <strong>Potential Risk:</strong> This alert indicates a potential issue that should be investigated and resolved soon. While not immediately critical, it may escalate if left unaddressed.
                      </>
                    )}
                    {selectedAlert.type === "info" && (
                      <>
                        <strong>Informational:</strong> This is an informational alert about a system event or status update. No immediate action required, but review recommended.
                      </>
                    )}
                    {selectedAlert.type === "success" && (
                      <>
                        <strong>Positive Update:</strong> This is a positive notification about a successfully completed action or resolved issue. Good news!
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Recommended Actions</h3>
                <div className="space-y-2">
                  {selectedAlert.type === "critical" && (
                    <>
                      <div className="flex gap-3 text-sm text-gray-">
                        <span className="text-violet-700">→</span>
                        <span>Immediately investigate the root cause and implement corrective measures</span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-">
                        <span className="text-violet-700">→</span>
                        <span>Notify relevant teams and escalate if needed</span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-">
                        <span className="text-violet-700">→</span>
                        <span>Monitor the affected system closely for the next 24 hours</span>
                      </div>
                    </>
                  )}
                  {selectedAlert.type === "warning" && (
                    <>
                      <div className="flex gap-3 text-sm text-gray-">
                        <span className="text-violet-700">→</span>
                        <span>Review the system metrics and identify the cause</span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-">
                        <span className="text-violet-700">→</span>
                        <span>Plan corrective actions within the next business day</span>
                      </div>
                    </>
                  )}
                  {selectedAlert.type === "info" && (
                    <div className="flex gap-3 text-sm text-gray-">
                      <span className="text-violet-700">→</span>
                      <span>Review the information and proceed with normal operations</span>
                    </div>
                  )}
                  {selectedAlert.type === "success" && (
                    <div className="flex gap-3 text-sm text-gray-">
                      <span className="text-violet-700">→</span>
                      <span>Continue monitoring to ensure stability is maintained</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  markAsRead(selectedAlert.id);
                  setSelectedAlert(null);
                }}
                className="flex-1 px-4 py-2 bg-violet-500/30 border border-violet-400 text-violet-700 rounded-lg hover:bg-violet-500/40 transition font-semibold"
              >
                Mark as Read
              </button>
              <button
                onClick={() => {
                  setSelectedAlert(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 border border-gray-200 text-white rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












