import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext, useState, useEffect } from "react";
import { getHistory, getHistoryStats } from "../../services/api";

export default function AdminDashboard() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [stats, setStats] = useState(null);
const [historyData, setHistoryData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        getHistoryStats(),
        getHistory(1, 100),
      ]);
      setStats(statsRes);
      setHistoryData(historyRes.history || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };
  fetchData();
}, []);

// Calculate real sentiment distribution
const positive = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "positive").length;
const negative = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "negative").length;
const neutral = historyData.filter(h => h.text?.sentiment?.toLowerCase() === "neutral").length;
const total = historyData.length || 1;

const sentimentDistData = [
  { name: "Positive", value: Math.round((positive / total) * 100), color: "#10b981" },
  { name: "Neutral", value: Math.round((neutral / total) * 100), color: "#f59e0b" },
  { name: "Negative", value: Math.round((negative / total) * 100), color: "#ef4444" },
];

// Calculate real sarcasm data
const sarcasmCount = historyData.filter(h => (h.results?.final_sarcasm_score || 0) > 0.5).length;
const nonSarcasmCount = historyData.length - sarcasmCount;
const sarcasmData = [
  { category: "Sarcasm", value: Math.round((sarcasmCount / total) * 100) },
  { category: "Non-Sarcasm", value: Math.round((nonSarcasmCount / total) * 100) },
];

// Active languages
const languages = [...new Set(historyData.map(h => h.detected_language).filter(Boolean))];

// Calculate real weekly sentiment trend from history data
const weeklyData = {};
historyData.forEach((item) => {
  const date = new Date(item.timestamp);
  const weekNum = Math.ceil(date.getDate() / 7);
  const weekKey = `Week ${weekNum}`;
  
  if (!weeklyData[weekKey]) {
    weeklyData[weekKey] = { week: weekKey, positive: 0, neutral: 0, negative: 0 };
  }
  
  const sentiment = item.text?.sentiment?.toLowerCase();
  if (sentiment === "positive") weeklyData[weekKey].positive += 1;
  else if (sentiment === "negative") weeklyData[weekKey].negative += 1;
  else weeklyData[weekKey].neutral += 1;
});

const sentimentTrendData = Object.values(weeklyData).sort((a, b) =>
  a.week.localeCompare(b.week)
);

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
        Admin Dashboard
      </h1>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Total Calls Analyzed</p>
          <h2 className="text-3xl font-bold text-green-500">{stats?.total_analyses || 0}</h2>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Avg Sarcasm Score</p>
          <h2 className="text-3xl font-bold text-purple-500">{stats?.avg_sarcasm_score?.toFixed(2) || "0.00"}</h2>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Active Languages</p>
          <h2 className="text-3xl font-bold text-purple-500">{languages.length || 0}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        
        {/* Sentiment Trend Over Time - Line Chart */}
        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Sentiment Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="#ffffff" style={{ fontSize: "12px" }} />
              <YAxis stroke="#ffffff" style={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive" />
              <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} name="Neutral" />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution - Pie Chart */}
        <div className={`rounded-xl p-6 border shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentDistData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "rgba(0,0,0,0.95)", border: "2px solid rgba(34, 211, 238, 0.8)", borderRadius: "8px", padding: "12px" }}
                labelStyle={{ color: "#22d3ee", fontWeight: "bold", fontSize: "14px" }}
                itemStyle={{ color: "#ffffff", fontSize: "13px" }}
                formatter={(value, name, props) => {
                  return [
                    `${props.payload.value}%`,
                    props.payload.name
                  ];
                }}
                cursor={{ fill: "rgba(255,255,255,0.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sarcasm Detection - Bar Chart */}
      <div className={`rounded-xl p-6 border shadow-sm mb-10 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Sarcasm vs Non-Sarcasm Detection</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sarcasmData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="category" stroke="#ffffff" style={{ fontSize: "12px" }} />
            <YAxis stroke="#ffffff" style={{ fontSize: "12px" }} />
            <Tooltip 
              contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }}
              labelStyle={{ color: "#ffffff" }}
              formatter={(value) => [`${value}%`, "Percentage"]}
            />
            <Bar dataKey="value" fill="#a855f7" name="Percentage" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
}











