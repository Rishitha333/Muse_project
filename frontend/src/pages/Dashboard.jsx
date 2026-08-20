import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, getHistoryStats, isAuthenticated } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, historyResponse] = await Promise.all([
          getHistoryStats(),
          getHistory(1, 5),
        ]);

        setStats(statsResponse);

        const transformed = historyResponse.history.map((item) => ({
          id: item._id,
          callId: item._id,
          timestamp: item.timestamp,
          language: `${item.input?.source_lang || "Unknown"} → ${item.input?.target_lang || "English"}`,
          sentiment: item.text?.sentiment || "N/A",
          sentimentType: (item.text?.sentiment || "neutral").toLowerCase(),
          sarcasm: item.results?.final_sarcasm_score
            ? (item.results.final_sarcasm_score * 100).toFixed(0)
            : "0",
          status: "completed",
        }));

        setRecentAnalyses(transformed);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.error || "Failed to load dashboard data");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="space-y-12">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Multimodal Sentiment & Sarcasm Intelligence
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="ml-4 text-gray-600">Loading dashboard...</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800"><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              ["Total Calls", stats?.total_analyses || 0, "text-violet-600"],
              ["Speech Accuracy", stats?.avg_stt_confidence ? (stats.avg_stt_confidence * 100).toFixed(0) + "%" : "0%", "text-green-600"],
              ["Translation Accuracy", stats?.avg_translation_confidence ? (stats.avg_translation_confidence * 100).toFixed(0) + "%" : "0%", "text-purple-600"],
              ["Sarcasm Index", stats?.avg_sarcasm_score ? (stats.avg_sarcasm_score * 100).toFixed(0) + "%" : "0%", "text-pink-600"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-lg p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <p className="text-gray-400 text-sm mb-2">{label}</p>
                <h2 className={`text-4xl font-bold ${color}`}>{value}</h2>
              </div>
            ))}
          </div>

          {/* RECENT CALL INTELLIGENCE */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Call Intelligence
            </h3>

            {recentAnalyses.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">No analyses yet.</p>
                <p className="text-gray-400 text-sm mt-2">Start analyzing calls to see data here!</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-800">
                      <th className="px-6 py-4 text-left text-gray-900 font-bold">Call ID</th>
                      <th className="px-6 py-4 text-left text-gray-900 font-bold">Timestamp</th>
                      <th className="px-6 py-4 text-left text-gray-900 font-bold">Sentiment</th>
                      <th className="px-6 py-4 text-left text-gray-900 font-bold">Sarcasm</th>
                      <th className="px-6 py-4 text-left text-gray-900 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAnalyses.map((item, index) => {
                      const sentimentColors = {
                        negative: "text-red-700 bg-red-50 border border-red-200",
                        positive: "text-green-700 bg-green-50 border border-green-200",
                        neutral: "text-yellow-700 bg-yellow-50 border border-yellow-200",
                      };
                      const statusColors = {
                        completed: "px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200",
                        pending: "px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200",
                        failed: "px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200",
                      };
                      const formatTimestamp = (ts) => new Date(ts).toLocaleString();
                      return (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 text-gray-800 transition">
                          <td className="px-6 py-4 text-violet-600 font-mono font-bold text-sm">
                            {String(item.callId).slice(0, 18)}...
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-sm">{formatTimestamp(item.timestamp)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${sentimentColors[item.sentimentType] || sentimentColors.neutral}`}>
                              {item.sentiment}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-violet-600 font-medium">{item.sarcasm}%</td>
                          <td className="px-6 py-4">
                            <span className={statusColors[item.status] || statusColors.completed}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}