import { useState, useContext, useEffect } from "react";
import { getHistory, getHistoryStats } from "../../services/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import { ThemeContext } from "../../context/ThemeContext";

export default function AdminReports() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState("date");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [customSearch, setCustomSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, historyRes] = await Promise.all([
          getHistoryStats(),
          getHistory(1, 100),
        ]);
        setStats(statsRes);
        setHistoryData(historyRes.history || []);
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCalls = stats?.total_analyses || 0;
  const positiveCalls = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "positive").length;
  const negativeCalls = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "negative").length;
  const neutralCalls = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "neutral").length;
  const total = historyData.length || 1;
  const positivePct = ((positiveCalls / total) * 100).toFixed(1);
  const negativePct = ((negativeCalls / total) * 100).toFixed(1);
  const neutralPct = ((neutralCalls / total) * 100).toFixed(1);
  const sarcasmCalls = historyData.filter(h => (h.results?.final_sarcasm_score || 0) > 0.5).length;
  const sarcasmPct = ((sarcasmCalls / total) * 100).toFixed(1);
  const avgSarcasm = stats?.avg_sarcasm_score?.toFixed(3) || "0";

  const langCounts = {};
  historyData.forEach(h => {
    const lang = h.detected_language || "Unknown";
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });
  const languageData = Object.entries(langCounts).map(([name, count], i) => ({
    name,
    value: Math.round((count / total) * 100),
    color: ["#22C1DC", "#7C3AED", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"][i % 6],
  }));

  const sarcasmData = [
    { category: "Sarcasm Detected", value: parseFloat(sarcasmPct), color: "#EF4444" },
    { category: "No Sarcasm", value: parseFloat((100 - sarcasmPct).toFixed(1)), color: "#10B981" },
  ];

  const hourCounts = {};
  historyData.forEach(h => {
    const hour = new Date(h.timestamp).getHours();
    const timeKey = `${String(hour).padStart(2, "0")}:00`;
    hourCounts[timeKey] = (hourCounts[timeKey] || 0) + 1;
  });
  const callVolumeData = Object.entries(hourCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, calls]) => ({ time, calls }));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = {};
  historyData.forEach(h => {
    const day = dayNames[new Date(h.timestamp).getDay()];
    if (!weeklyData[day]) weeklyData[day] = { day, Positive: 0, Neutral: 0, Negative: 0 };
    const s = h.text?.sentiment?.toLowerCase();
    if (s === "positive") weeklyData[day].Positive += 1;
    else if (s === "negative") weeklyData[day].Negative += 1;
    else weeklyData[day].Neutral += 1;
  });
  const sentimentTrendData = dayNames.filter(d => weeklyData[d]).map(d => weeklyData[d]);
  const activeLanguages = Object.keys(langCounts).length;

  const kpis = [
    { label: "Total Calls Analyzed", value: totalCalls.toString(), color: "text-violet-700" },
    { label: "Avg Call Duration", value: "N/A", color: "text-green-700" },
    { label: "Positive Sentiment %", value: `${positivePct}%`, color: "text-emerald-700" },
    { label: "Sarcasm Detection Rate", value: `${sarcasmPct}%`, color: "text-orange-700" },
    { label: "Avg Sarcasm Score", value: avgSarcasm, color: "text-pink-700" },
    { label: "Languages Detected", value: activeLanguages.toString(), color: "text-purple-700" },
  ];

  const userMap = {};
  historyData.forEach(h => {
    const email = h.user_email || "Unknown";
    if (!userMap[email]) userMap[email] = { user: email, callsHandled: 0, satisfaction: 0 };
    userMap[email].callsHandled += 1;
    if (h.text?.sentiment?.toLowerCase() === "positive") userMap[email].satisfaction += 1;
  });
  const userPerformanceData = Object.values(userMap).map(u => ({
    ...u,
    avgRating: (u.satisfaction / (u.callsHandled || 1) * 5).toFixed(1),
    satisfaction: Math.round((u.satisfaction / (u.callsHandled || 1)) * 100),
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;
    doc.setFontSize(18);
    doc.text("MUSE - Reports & Analytics", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.setFontSize(12);
    doc.text("Key Performance Indicators", 15, yPosition);
    yPosition += 8;
    doc.setFontSize(9);
    kpis.forEach((kpi) => {
      doc.text(`${kpi.label}: ${kpi.value}`, 20, yPosition);
      yPosition += 6;
      if (yPosition > pageHeight - 20) { doc.addPage(); yPosition = 15; }
    });
    doc.save(`MUSE_analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button onClick={downloadPDF} className="px-6 py-2 bg-purple-500/30 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-500/40 transition font-semibold">
          Download PDF
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="ml-4 text-gray-600">Loading reports...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Date Range */}
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <label className="text-sm block mb-3">Select Date Range:</label>
            <div className="flex gap-2 flex-wrap mb-4">
              {[{ label: "By Date", value: "date" }, { label: "By Month", value: "month" }, { label: "Custom", value: "custom" }].map((option) => (
                <button key={option.value} onClick={() => setSelectedDateRange(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${selectedDateRange === option.value ? "bg-violet-500/40 border border-violet-400 text-violet-700" : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"}`}>
                  {option.label}
                </button>
              ))}
            </div>
            {selectedDateRange === "date" && (
              <div className="flex gap-3">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium">Apply</button>
              </div>
            )}
            {selectedDateRange === "month" && (
              <div className="flex gap-3">
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium">Apply</button>
              </div>
            )}
            {selectedDateRange === "custom" && (
              <div className="flex gap-3">
                <input type="text" placeholder="Enter custom date range..." value={customSearch} onChange={(e) => setCustomSearch(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium">Search</button>
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {kpis.map((kpi, index) => (
              <div key={index} className="rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-2">{kpi.label}</p>
                <h3 className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</h3>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            {[{ id: "overview", label: "Overview" }, { id: "language", label: "Language Distribution" }, { id: "sentiment", label: "Analysis" }, { id: "performance", label: "User Performance" }].map((tab) => (
              <button key={tab.id} onClick={() => setSelectedReport(tab.id)}
                className={`px-6 py-3 font-semibold transition border-b-2 ${selectedReport === tab.id ? "text-violet-700 border-violet-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {selectedReport === "overview" && (
            <div className="space-y-6">
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume by Hour</h3>
                {callVolumeData.length === 0 ? <p className="text-gray-500 text-center py-8">No data available yet</p> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={callVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calls" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend (by Day)</h3>
                {sentimentTrendData.length === 0 ? <p className="text-gray-500 text-center py-8">No data available yet</p> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Positive" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Neutral" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="Negative" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Sentiment */}
          {selectedReport === "sentiment" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={[{ name: "Positive", value: parseFloat(positivePct) }, { name: "Neutral", value: parseFloat(neutralPct) }, { name: "Negative", value: parseFloat(negativePct) }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      <Cell fill="#10B981" /><Cell fill="#F59E0B" /><Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-600">Positive:</span><span className="text-green-700 font-semibold">{positivePct}% ({positiveCalls} calls)</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Neutral:</span><span className="text-yellow-700 font-semibold">{neutralPct}% ({neutralCalls} calls)</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Negative:</span><span className="text-red-700 font-semibold">{negativePct}% ({negativeCalls} calls)</span></div>
                </div>
              </div>
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sarcasm Detection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sarcasmData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {sarcasmData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-600">Sarcasm Detected:</span><span className="text-red-700 font-semibold">{sarcasmPct}% ({sarcasmCalls} calls)</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">No Sarcasm:</span><span className="text-green-700 font-semibold">{(100 - sarcasmPct).toFixed(1)}% ({historyData.length - sarcasmCalls} calls)</span></div>
                </div>
              </div>
              <div className="lg:col-span-2 rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg"><p className="text-green-700 text-sm font-semibold mb-1">📈 Positive Rate</p><p className="text-gray-900 text-sm">{positivePct}% of calls have positive sentiment</p></div>
                  <div className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-lg"><p className="text-orange-700 text-sm font-semibold mb-1">⚠️ Sarcasm Rate</p><p className="text-gray-900 text-sm">{sarcasmPct}% of calls contain sarcasm</p></div>
                  <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg"><p className="text-red-700 text-sm font-semibold mb-1">📉 Negative Rate</p><p className="text-gray-900 text-sm">{negativePct}% of calls have negative sentiment</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Language */}
          {selectedReport === "language" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
                {languageData.length === 0 ? <p className="text-gray-500 text-center py-8">No data available yet</p> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={languageData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                        {languageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Statistics</h3>
                <div className="space-y-3">
                  {languageData.map((lang, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700">{lang.name}</span>
                        <span className="text-gray-900 font-semibold">{lang.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full" style={{ width: `${lang.value}%`, backgroundColor: lang.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Performance */}
          {selectedReport === "performance" && (
            <div className="rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">User Performance Metrics</h3>
              {userPerformanceData.length === 0 ? <p className="text-gray-500 text-center py-8">No user data available yet</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? "bg-slate-800 border-slate-700" : "border-gray-200"}`}>
                        <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>User</th>
                        <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Avg Rating</th>
                        <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Calls Handled</th>
                        <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Satisfaction</th>
                        <th className={`text-left px-6 py-4 font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPerformanceData.map((user, index) => (
                        <tr key={index} className={`border-b transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-gray-100" : "border-gray-100 hover:bg-gray-50 text-gray-800"}`}>
                          <td className={`px-6 py-4 font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}>{user.user}</td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-yellow-500 font-semibold">{user.avgRating}</span><span className="text-yellow-500">★</span></div></td>
                          <td className={`px-6 py-4 font-semibold ${isDark ? "text-cyan-400" : "text-violet-700"}`}>{user.callsHandled}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.satisfaction >= 90 ? "bg-green-500/20 text-green-700 border border-green-400/30" : user.satisfaction >= 70 ? "bg-purple-500/20 text-purple-700 border border-purple-400/30" : "bg-yellow-500/20 text-yellow-700 border border-yellow-400/30"}`}>
                              {user.satisfaction}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`w-32 rounded-full h-2 overflow-hidden ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
                              <div className="h-full bg-gradient-to-r from-violet-400 to-purple-600" style={{ width: `${user.satisfaction}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}