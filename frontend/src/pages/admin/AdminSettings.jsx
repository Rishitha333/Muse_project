import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import jsPDF from 'jspdf';
import { getCurrentUser } from "../../services/api";
import API from "../../services/api";

export default function AdminSettings() {
  const { theme, changeTheme } = useTheme();
  const isDark = theme === "dark";
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await getCurrentUser();
        setAdminUser(response.user);
      } catch (err) {
        console.error("Failed to fetch admin user:", err);
      }
    };
    fetchAdmin();
  }, []);

  const defaultSettings = {
    defaultTheme: "light",
    versionInfo: "1.0.0",
    sarcasmModelVersion: "v2.1",
    sentimentModelVersion: "v3.0",
    maxUploadSize: "50MB",
    maxDuration: "120",
    feedbackEnabled: true,
    feedbackChannel: "in-app",
    collectRatings: true,
    responseTimeTarget: "24",
    feedbackCategories: ["Bug Report", "Feature Request", "General Feedback"],
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("adminSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [saveStatus, setSaveStatus] = useState("");
  const [activeSection, setActiveSection] = useState("platform");
  const [showFeedbackDashboard, setShowFeedbackDashboard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
  const userFeedback = JSON.parse(localStorage.getItem("userFeedback") || "[]");

  const sampleFeedbackData = [
    { id: 1, category: "Bug Report", title: "Sarcasm detection not working", rating: 2, date: "2026-02-03", userName: "John Doe" },
    { id: 2, category: "Feature Request", title: "Add export to CSV", rating: 4, date: "2026-02-02", userName: "Jane Smith" },
    { id: 3, category: "General Feedback", title: "Great app overall", rating: 5, date: "2026-02-01", userName: "Mike Johnson" },
    { id: 4, category: "Bug Report", title: "Audio upload timeout", rating: 1, date: "2026-01-31", userName: "Sarah Wilson" },
    { id: 5, category: "Feature Request", title: "Dark mode looks great", rating: 5, date: "2026-01-30", userName: "Tom Brown" },
  ];

  const feedbackData = [...userFeedback, ...sampleFeedbackData].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleToggle = (key) => setSettings({ ...settings, [key]: !settings[key] });
  const handleChange = (key, value) => setSettings({ ...settings, [key]: value });

  const handleDeleteFeedback = (feedbackId) => {
    const updatedFeedback = userFeedback.filter(f => f.id !== feedbackId);
    localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
    setSettings({ ...settings });
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 3000);
    }, 1000);
  };

  const bgClass = isDark ? "bg-slate-900" : "bg-white";
  const borderClass = isDark ? "border-slate-700" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-slate-400" : "text-gray-600";
  const inputBgClass = isDark ? "bg-slate-800 text-white border-slate-600" : "bg-white text-gray-900 border-gray-300";
  const selectBgClass = isDark ? "bg-slate-800 text-white border-slate-600" : "bg-white text-gray-900 border-gray-300";
  const cardBgClass = isDark ? "bg-slate-800" : "bg-gray-50";
  const badgeOnClass = isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
  const badgeOffClass = isDark ? "bg-gray-700/50 text-gray-400" : "bg-gray-100 text-gray-600";
  const headerGradient = isDark ? "from-slate-700/20 to-slate-600/20" : "from-violet-500/10 to-purple-500/10";

  const sections = [
    { id: "platform", label: "Platform", icon: "🖥️" },
    { id: "ai-models", label: "AI Models", icon: "🤖" },
    { id: "audio", label: "Audio Controls", icon: "🎵" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "feedback", label: "User Feedback", icon: "💬" },
  ];

  return (
    <div className={`space-y-8 min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Page Header */}
      <div className={`bg-gradient-to-r ${headerGradient} border ${borderClass} rounded-xl p-8`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${textClass} mb-2`}>System Settings</h1>
            <p className={mutedTextClass}>Configure and manage all system-wide settings</p>
          </div>
          <div className="text-4xl">⚙️</div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className={`rounded-xl border ${borderClass} ${bgClass} p-6 overflow-x-auto`}>
        <div className="flex gap-2 min-w-max">
          {sections.map((section) => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                activeSection === section.id ? "bg-violet-600 text-white" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}>
              {section.icon} {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className={`rounded-xl p-8 border ${borderClass} ${bgClass} space-y-6`}>

        {/* Platform */}
        {activeSection === "platform" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>🖥️ Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Default Theme</label>
                <select value={theme} onChange={(e) => changeTheme(e.target.value)} className={`w-full border ${selectBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <p className={`text-sm ${mutedTextClass} mt-2`}>Choose default theme for all users</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Version Info</label>
                <input type="text" value={settings.versionInfo} disabled className={`w-full border ${selectBgClass} rounded-lg p-3 opacity-60`} />
                <p className={`text-sm ${mutedTextClass} mt-2`}>Current system version</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Models */}
        {activeSection === "ai-models" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>🤖 AI Model Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Sarcasm Model Version</label>
                <input type="text" value={settings.sarcasmModelVersion} onChange={(e) => handleChange("sarcasmModelVersion", e.target.value)} className={`w-full border ${inputBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`} />
              </div>
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Sentiment Model Version</label>
                <input type="text" value={settings.sentimentModelVersion} onChange={(e) => handleChange("sentimentModelVersion", e.target.value)} className={`w-full border ${inputBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`} />
              </div>
            </div>
          </div>
        )}

        {/* Audio */}
        {activeSection === "audio" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>🎵 Audio Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Max Upload Size</label>
                <select value={settings.maxUploadSize} onChange={(e) => handleChange("maxUploadSize", e.target.value)} className={`w-full border ${selectBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`}>
                  <option value="10MB">10MB</option>
                  <option value="25MB">25MB</option>
                  <option value="50MB">50MB</option>
                  <option value="100MB">100MB</option>
                  <option value="500MB">500MB</option>
                </select>
              </div>
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Max Duration (minutes)</label>
                <input type="number" value={settings.maxDuration} onChange={(e) => handleChange("maxDuration", e.target.value)} className={`w-full border ${inputBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`} />
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeSection === "profile" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>👤 Admin Profile</h2>
            <div className={`p-6 border ${borderClass} rounded-lg ${cardBgClass} space-y-6`}>
              <div className="space-y-4">
                <div>
                  <label className={`block ${textClass} font-semibold mb-2`}>Admin Name</label>
                  <div className={`w-full px-4 py-3 border ${borderClass} rounded-lg ${selectBgClass} opacity-70`}>{adminUser?.username || 'Administrator'}</div>
                </div>
                <div>
                  <label className={`block ${textClass} font-semibold mb-2`}>Email Address</label>
                  <div className={`w-full px-4 py-3 border ${borderClass} rounded-lg ${selectBgClass} opacity-70`}>{adminUser?.email || 'N/A'}</div>
                </div>
                <div>
                  <label className={`block ${textClass} font-semibold mb-2`}>Role</label>
                  <div className={`w-full px-4 py-3 border ${borderClass} rounded-lg ${selectBgClass} opacity-70`}>{adminUser?.role || 'admin'}</div>
                </div>
                <div>
                  <label className={`block ${textClass} font-semibold mb-2`}>Last Login</label>
                  <div className={`w-full px-4 py-3 border ${borderClass} rounded-lg ${selectBgClass} opacity-70`}>{'Today at ' + new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              <div className={`pt-6 border-t ${borderClass}`}>
                <button onClick={() => { setShowResetPasswordModal(true); setResetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setResetPasswordSuccess(false); }}
                  className="w-full px-6 py-3 bg-orange-500/30 border border-orange-400 text-orange-700 font-semibold rounded-lg hover:bg-orange-500/40 transition">
                  🔐 Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {activeSection === "feedback" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>💬 User Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Feedback Channel</label>
                <select value={settings.feedbackChannel} onChange={(e) => handleChange("feedbackChannel", e.target.value)} className={`w-full border ${selectBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`}>
                  <option value="in-app">In-App Form</option>
                  <option value="email">Email</option>
                  <option value="both">Both In-App & Email</option>
                </select>
              </div>
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Response Time Target (hours)</label>
                <input type="number" value={settings.responseTimeTarget} onChange={(e) => handleChange("responseTimeTarget", e.target.value)} min="1" max="168" className={`w-full border ${inputBgClass} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500`} />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`flex items-center p-4 ${cardBgClass} rounded-lg cursor-pointer hover:shadow-sm transition border ${borderClass}`}>
                <input type="checkbox" checked={settings.feedbackEnabled} onChange={() => handleToggle("feedbackEnabled")} className="w-5 h-5 rounded accent-violet-600" />
                <div className="ml-4 flex-1">
                  <span className={`block ${textClass} font-semibold`}>Enable Feedback Collection</span>
                  <span className={`text-sm ${mutedTextClass}`}>Allow users to submit feedback</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${settings.feedbackEnabled ? badgeOnClass : badgeOffClass}`}>{settings.feedbackEnabled ? 'ON' : 'OFF'}</span>
              </label>
              <label className={`flex items-center p-4 ${cardBgClass} rounded-lg cursor-pointer hover:shadow-sm transition border ${borderClass}`}>
                <input type="checkbox" checked={settings.collectRatings} onChange={() => handleToggle("collectRatings")} className="w-5 h-5 rounded accent-violet-600" />
                <div className="ml-4 flex-1">
                  <span className={`block ${textClass} font-semibold`}>Collect Ratings</span>
                  <span className={`text-sm ${mutedTextClass}`}>Include star ratings in feedback forms</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${settings.collectRatings ? badgeOnClass : badgeOffClass}`}>{settings.collectRatings ? 'ON' : 'OFF'}</span>
              </label>
            </div>

            <div>
              <label className={`block ${textClass} font-semibold mb-3`}>Feedback Categories</label>
              <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg" style={{backgroundColor: isDark ? '#1e293b' : '#f8fafc'}}>
                {settings.feedbackCategories && settings.feedbackCategories.length > 0 ? (
                  settings.feedbackCategories.map((category, idx) => (
                    <div key={idx} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition transform hover:scale-105 ${idx % 3 === 0 ? 'bg-blue-500 text-white' : idx % 3 === 1 ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      <span>{category}</span>
                      <button onClick={() => handleChange("feedbackCategories", settings.feedbackCategories.filter((_, i) => i !== idx))} className="text-lg font-bold hover:opacity-70 transition">×</button>
                    </div>
                  ))
                ) : (
                  <span className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No categories added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter' && newCategoryInput.trim()) { handleChange("feedbackCategories", [...settings.feedbackCategories, newCategoryInput.trim()]); setNewCategoryInput(""); }}}
                  placeholder="Type category and press Enter"
                  className={`flex-1 px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-violet-500`} />
                <button onClick={() => { if (newCategoryInput.trim()) { handleChange("feedbackCategories", [...settings.feedbackCategories, newCategoryInput.trim()]); setNewCategoryInput(""); }}}
                  className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition">Add</button>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => setShowFeedbackDashboard(true)} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">📊 View Feedback Dashboard</button>
              <button onClick={() => setShowExportModal(true)} className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">✉️ Export Feedback Report</button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Dashboard Modal */}
      {showFeedbackDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgClass} border ${borderClass} rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl`}>
            <div className="p-6 border-b border-gray-300 dark:border-slate-700 flex justify-between items-center">
              <h3 className={`text-2xl font-bold ${textClass}`}>📊 Feedback Dashboard</h3>
              <button onClick={() => setShowFeedbackDashboard(false)} className={`text-2xl font-bold ${textClass} hover:opacity-70`}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4 text-center`}>
                  <p className="text-2xl font-bold text-blue-600">{feedbackData.length}</p>
                  <p className={`text-sm ${mutedTextClass}`}>Total Feedback</p>
                </div>
                <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4 text-center`}>
                  <p className="text-2xl font-bold text-purple-600">{(feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)}</p>
                  <p className={`text-sm ${mutedTextClass}`}>Avg Rating</p>
                </div>
                <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4 text-center`}>
                  <p className="text-2xl font-bold text-green-600">{feedbackData.filter(f => f.category === "Bug Report").length}</p>
                  <p className={`text-sm ${mutedTextClass}`}>Bug Reports</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className={`font-semibold ${textClass} mb-3`}>Recent Feedback</h4>
                {feedbackData.map((feedback) => (
                  <div key={feedback.id} className={`${cardBgClass} border ${borderClass} rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className={`font-semibold ${textClass}`}>{feedback.title}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{feedback.userName} • {feedback.date}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${feedback.category === "Bug Report" ? "bg-red-100 text-red-700" : feedback.category === "Feature Request" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{feedback.category}</span>
                        {userFeedback.find(f => f.id === feedback.id) && (
                          <button onClick={() => handleDeleteFeedback(feedback.id)} className="text-red-500 hover:text-red-700 px-2 py-1 rounded transition">✕</button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className={`ml-1 font-semibold ${textClass}`}>{feedback.rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgClass} border ${borderClass} rounded-xl max-w-md w-full shadow-xl`}>
            <div className="p-6 border-b border-gray-300 dark:border-slate-700 flex justify-between items-center">
              <h3 className={`text-2xl font-bold ${textClass}`}>✉️ Export Feedback Report</h3>
              <button onClick={() => setShowExportModal(false)} className={`text-2xl font-bold ${textClass} hover:opacity-70`}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block ${textClass} font-semibold mb-2`}>Date Range</label>
                <select className={`w-full border ${selectBgClass} rounded-lg p-3`}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All Time</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => {
                  try {
                    const doc = new jsPDF();
                    let yPosition = 20;
                    const pageHeight = doc.internal.pageSize.height;
                    const margin = 20;
                    const lineHeight = 7;
                    feedbackData.forEach((item, idx) => {
                      if (yPosition > pageHeight - margin) { doc.addPage(); yPosition = 20; }
                      doc.setFontSize(12); doc.setFont(undefined, "bold");
                      doc.text(`FEEDBACK REPORT ${idx + 1}`, margin, yPosition); yPosition += lineHeight;
                      doc.line(margin, yPosition, 190, yPosition); yPosition += lineHeight;
                      doc.setFontSize(10); doc.setFont(undefined, "normal");
                      doc.text(`User: ${item.userName || 'N/A'}`, margin, yPosition); yPosition += lineHeight;
                      doc.text(`Date: ${item.date || 'N/A'}`, margin, yPosition); yPosition += lineHeight;
                      doc.text(`Category: ${item.category || 'N/A'}`, margin, yPosition); yPosition += lineHeight;
                      doc.text(`Rating: ${item.rating || 'N/A'}/5`, margin, yPosition); yPosition += lineHeight * 1.5;
                      doc.text(`Title: ${item.title || 'N/A'}`, margin, yPosition); yPosition += lineHeight * 2;
                    });
                    doc.save(`MUSE_feedback_${new Date().toISOString().split('T')[0]}.pdf`);
                    alert("✓ Feedback exported successfully!");
                    setShowExportModal(false);
                  } catch (error) {
                    alert("Error generating PDF. Please try again.");
                  }
                }} className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">📥 Export PDF</button>
                <button onClick={() => setShowExportModal(false)} className={`flex-1 px-4 py-2 border ${borderClass} ${textClass} font-semibold rounded-lg hover:opacity-70 transition`}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgClass} border ${borderClass} rounded-xl max-w-md w-full shadow-xl`}>
            <div className="p-6 border-b border-gray-300 dark:border-slate-700 flex justify-between items-center">
              <h3 className={`text-2xl font-bold ${textClass}`}>🔐 Reset Password</h3>
              <button onClick={() => setShowResetPasswordModal(false)} className={`text-3xl font-bold ${textClass} hover:opacity-70`}>✕</button>
            </div>
            <div className="p-6">
              {!resetPasswordSuccess ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block ${textClass} font-semibold mb-2`}>Current Password</label>
                    <input type="password" value={resetPasswordForm.currentPassword} onChange={(e) => setResetPasswordForm({...resetPasswordForm, currentPassword: e.target.value})} placeholder="Enter current password" className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${selectBgClass}`} />
                  </div>
                  <div>
                    <label className={`block ${textClass} font-semibold mb-2`}>New Password</label>
                    <input type="password" value={resetPasswordForm.newPassword} onChange={(e) => setResetPasswordForm({...resetPasswordForm, newPassword: e.target.value})} placeholder="Enter new password (min. 8 characters)" className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${selectBgClass}`} />
                  </div>
                  <div>
                    <label className={`block ${textClass} font-semibold mb-2`}>Confirm Password</label>
                    <input type="password" value={resetPasswordForm.confirmPassword} onChange={(e) => setResetPasswordForm({...resetPasswordForm, confirmPassword: e.target.value})} placeholder="Confirm new password" className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${selectBgClass}`} />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={async () => {
                        if (resetPasswordForm.newPassword.length < 8) { alert("Password must be at least 8 characters long"); return; }
                        if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) { alert("New passwords do not match"); return; }
                        try {
                          await API.post("/api/auth/change-password", {
                            old_password: resetPasswordForm.currentPassword,
                            new_password: resetPasswordForm.newPassword,
                          }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                          setResetPasswordSuccess(true);
                          setTimeout(() => { setShowResetPasswordModal(false); setResetPasswordSuccess(false); }, 2000);
                        } catch (err) {
                          alert(err.response?.data?.error || "Failed to reset password. Check your current password.");
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
                      Reset Password
                    </button>
                    <button onClick={() => setShowResetPasswordModal(false)} className={`flex-1 px-4 py-3 border-2 ${borderClass} ${textClass} font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition`}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-50'} border-2 ${isDark ? 'border-green-600' : 'border-green-300'}`}>
                    <span className="text-3xl">✓</span>
                  </div>
                  <h4 className={`text-lg font-semibold ${textClass}`}>Password Reset Successful</h4>
                  <p className={mutedTextClass}>Your password has been updated successfully.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className={`flex gap-4 sticky bottom-6 rounded-lg p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${borderClass} shadow-lg`}>
        <button onClick={handleSave}
          className={`px-8 py-3 font-semibold rounded-lg transition ${saveStatus === "saving" ? "bg-violet-500 text-white opacity-70 cursor-not-allowed" : saveStatus === "success" ? "bg-green-500 text-white" : "bg-violet-600 text-white hover:bg-violet-700"}`}>
          {saveStatus === "saving" ? "💾 Saving..." : saveStatus === "success" ? "✓ Saved!" : "💾 Save Settings"}
        </button>
      </div>
    </div>
  );
}