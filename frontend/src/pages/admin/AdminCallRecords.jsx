import { useState, useContext, useEffect, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { getAdminCalls } from "../../services/api";

export default function AdminCallRecords() {
  const { theme } = useContext(ThemeContext);
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [callRecords, setCallRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("All");
  const [filterSarcasm, setFilterSarcasm] = useState("All");
  const [selectedCallRecord, setSelectedCallRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /** Load every analysis across all users, via the admin endpoint. */
  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCalls(1, 100);

      setCallRecords(
        response.calls.map((item) => {
          const when = item.timestamp ? new Date(item.timestamp) : null;
          const score = item.final_sarcasm_score;

          return {
            id: item._id,
            callId: item.call_id || item._id,
            user: item.user_email || "Unknown",
            username: item.username || "",
            date: when
              ? when.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Unknown",
            time: when
              ? when.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            timestamp: when ? when.toLocaleString() : "Unknown",
            sentiment: item.sentiment || "N/A",
            sarcasmScore: score ?? null,
            sarcasm: score != null && score > 0.5 ? "Yes" : "No",
            sttConfidence: item.stt_confidence,
            language: item.detected_language || "Unknown",
            translationLanguage: item.target_language || "Unknown",
            hasAudio: item.has_audio,
            transcript: item.transcript || "",
          };
        })
      );
    } catch (err) {
      console.error("Failed to fetch call records:", err);
      setError(
        err.response?.data?.error ||
          "Could not load call records. Check that you are signed in as an administrator."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterSentiment("All");
    setFilterSarcasm("All");
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-500/20 border-green-400 text-green-700";
      case "Negative":
        return "bg-red-500/20 border-red-400 text-red-700";
      case "Neutral":
        return "bg-yellow-500/20 border-yellow-400 text-yellow-700";
      default:
        return "bg-gray-100 border-gray-200 text-gray-900";
    }
  };

  const filteredRecords = callRecords.filter((record) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      record.callId.toLowerCase().includes(term) ||
      record.user.toLowerCase().includes(term) ||
      record.transcript.toLowerCase().includes(term);
    const matchesSentiment =
      filterSentiment === "All" || record.sentiment === filterSentiment;
    const matchesSarcasm =
      filterSarcasm === "All" || record.sarcasm === filterSarcasm;
    return matchesSearch && matchesSentiment && matchesSarcasm;
  });

  /** Export what is on screen, respecting the active filters. */
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      showSuccess("No records to export");
      return;
    }

    const headers = [
      "Call ID",
      "User",
      "Timestamp",
      "Sentiment",
      "Sarcasm Score",
      "Sarcasm Detected",
      "STT Confidence",
      "Source Language",
      "Target Language",
      "Has Audio",
      "Transcript",
    ];

    const rows = filteredRecords.map((r) => [
      r.callId,
      r.user,
      r.timestamp,
      r.sentiment,
      r.sarcasmScore ?? "",
      r.sarcasm,
      r.sttConfidence ?? "",
      r.language,
      r.translationLanguage,
      r.hasAudio ? "Yes" : "No",
      r.transcript.replace(/"/g, "'"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `MUSE_call_records_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${filteredRecords.length} records`);
  };

  // Summary figures, all derived from the real records
  const totalRecords = callRecords.length;
  const sarcasticCount = callRecords.filter((r) => r.sarcasm === "Yes").length;
  const audioCount = callRecords.filter((r) => r.hasAudio).length;
  const languageCount = new Set(
    callRecords.map((r) => r.language).filter((l) => l && l !== "Unknown")
  ).size;

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="ml-4 text-gray-600">Loading call records...</p>
        </div>
      )}

      {error && !loading && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Call Records</h1>
        <div className="flex gap-3">
          <button
            onClick={loadRecords}
            className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-violet-500/30 border border-violet-400 text-violet-700 rounded-lg hover:bg-violet-500/40 transition font-semibold"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics — every figure computed from the loaded records */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Total Records</p>
          <h2 className="text-3xl font-bold text-violet-700">{totalRecords}</h2>
        </div>
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Sarcasm Detected</p>
          <h2 className="text-3xl font-bold text-orange-600">
            {sarcasticCount}
          </h2>
        </div>
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">With Audio</p>
          <h2 className="text-3xl font-bold text-green-700">{audioCount}</h2>
        </div>
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Languages Seen</p>
          <h2 className="text-3xl font-bold text-purple-700">
            {languageCount}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-600 text-sm block mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by call ID, user, or transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm block mb-2">Sentiment</label>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="All">All</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 text-sm block mb-2">Sarcasm</label>
            <select
              value={filterSarcasm}
              onChange={(e) => setFilterSarcasm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="All">All</option>
              <option value="Yes">Detected</option>
              <option value="No">Not detected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <th className="text-left px-6 py-4 font-bold">Call ID</th>
                <th className="text-left px-6 py-4 font-bold">User</th>
                <th className="text-left px-6 py-4 font-bold">Date &amp; Time</th>
                <th className="text-left px-6 py-4 font-bold">Language</th>
                <th className="text-left px-6 py-4 font-bold">Sentiment</th>
                <th className="text-left px-6 py-4 font-bold">Sarcasm</th>
                <th className="text-left px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className={`border-b transition ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-gray-100"
                      : "border-gray-100 hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <td
                    className={`px-6 py-4 font-semibold font-mono text-sm ${
                      isDark ? "text-cyan-400" : "text-violet-700"
                    }`}
                  >
                    {record.callId}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{record.username || "—"}</p>
                    <p className="text-sm text-gray-600">{record.user}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{record.timestamp}</td>
                  <td className="px-6 py-4 text-sm">
                    {record.language}
                    {record.translationLanguage &&
                    record.translationLanguage !== "Unknown"
                      ? ` → ${record.translationLanguage}`
                      : ""}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                        record.sentiment
                      )}`}
                    >
                      {record.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        record.sarcasm === "Yes"
                          ? "text-orange-700 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {record.sarcasmScore != null
                        ? record.sarcasmScore.toFixed(2)
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedCallRecord(record);
                        setShowDetailsModal(true);
                      }}
                      className="text-violet-700 hover:text-violet-900 font-medium text-sm transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && !loading && !error && (
        <div className="rounded-xl p-12 text-center border border-gray-200 shadow-sm mt-4">
          <p className="text-gray-700 text-lg">
            {callRecords.length === 0
              ? "No analyses have been run yet."
              : "No call records match your filters."}
          </p>
        </div>
      )}

      {/* Call Details Modal */}
      {showDetailsModal && selectedCallRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-lg bg-white max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Call Details
            </h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Call ID</span>
                <span className="text-gray-900 font-mono">
                  {selectedCallRecord.callId}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">User</span>
                <span className="text-gray-900">{selectedCallRecord.user}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Date</span>
                <span className="text-gray-900">
                  {selectedCallRecord.date} {selectedCallRecord.time}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Language</span>
                <span className="text-gray-900">
                  {selectedCallRecord.language} →{" "}
                  {selectedCallRecord.translationLanguage}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Input</span>
                <span className="text-gray-900">
                  {selectedCallRecord.hasAudio ? "Audio" : "Text only"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Sentiment</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                    selectedCallRecord.sentiment
                  )}`}
                >
                  {selectedCallRecord.sentiment}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-700 font-medium">Sarcasm score</span>
                <span
                  className={
                    selectedCallRecord.sarcasm === "Yes"
                      ? "text-orange-700 font-semibold"
                      : "text-green-700 font-semibold"
                  }
                >
                  {selectedCallRecord.sarcasmScore != null
                    ? `${selectedCallRecord.sarcasmScore.toFixed(3)} (${
                        selectedCallRecord.sarcasm === "Yes"
                          ? "detected"
                          : "not detected"
                      })`
                    : "—"}
                </span>
              </div>
              {selectedCallRecord.sttConfidence != null && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-700 font-medium">
                    Transcription confidence
                  </span>
                  <span className="text-gray-900">
                    {selectedCallRecord.sttConfidence}
                  </span>
                </div>
              )}
            </div>

            {selectedCallRecord.transcript && (
              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-2 text-sm">
                  Transcript
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-sm">
                  {selectedCallRecord.transcript}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full px-4 py-2 bg-violet-600 border border-violet-500 text-white font-semibold rounded-lg hover:bg-violet-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-500/20 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-sm z-40">
          {successMessage}
        </div>
      )}
    </div>
  );
}