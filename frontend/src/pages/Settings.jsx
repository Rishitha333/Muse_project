import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getCurrentUser, logout, updateProfile } from "../services/api";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Settings() {
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/120/5B2FD6/FFFFFF?text=User");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        const user = response.user;
        setUserName(user.username || "");
        setEmail(user.email || "");
        // Load saved profile picture
        if (user.profile?.avatar) {
          setProfilePic(user.profile.avatar);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("General Feedback");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [helpCenterModal, setHelpCenterModal] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState("faq");
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      // Profile
      language: "English",
      // Transcription
      transcriptionLanguage: "English",
      accentOptimization: true,
      autoPunctuation: true,
      speakerSeparation: true,
      // Translation
      autoTranslate: false,
      outputLanguage: "Spanish",
      showOriginalTranslated: true,
      accuracyLevel: "High",
      // Notifications
      emailAlerts: true,
      taskCompleted: true,
      notificationFrequency: "instant",
      // Privacy & Security
      twoFactorAuth: false,
      // Appearance
      theme: theme,
      fontSize: "medium",
      layout: "comfortable",
    };
  });

const handleProfilePicChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      setProfilePic(base64Image);
      // Save to backend
      try {
        await updateProfile({ profile: { avatar: base64Image } });
        console.log("Profile picture saved!");
      } catch (err) {
        console.error("Failed to save profile picture:", err);
      }
    };
    reader.readAsDataURL(file);
  }
};

  // Apply font size to document
  useEffect(() => {
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    document.documentElement.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Apply layout
    document.documentElement.setAttribute("data-layout", settings.layout);
    
    // Save settings to localStorage
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  const handleNameSave = () => {
    setUserName(tempName);
    setEditingName(false);
  };

  const handleToggle = (key) => {
    const newState = !settings[key];
    
    // Handle browser notification permission
    if (key === "taskCompleted" && newState && "Notification" in window) {
      if (Notification.permission === "granted") {
        // Permission already granted
        new Notification("Notifications Enabled", {
          body: "You'll receive notifications when analysis is complete",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237c3aed'><path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V2c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 3.36 6 5.92 6 9v5l-2 2v1h16v-1l-2-2z'/></svg>",
        });
      } else if (Notification.permission !== "denied") {
        // Request permission
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Notifications Enabled", {
              body: "You'll receive notifications when analysis is complete",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237c3aed'><path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V2c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 3.36 6 5.92 6 9v5l-2 2v1h16v-1l-2-2z'/></svg>",
            });
          }
        });
      }
    }
    
    setSettings({ ...settings, [key]: newState });
    
    // Show console feedback for toggle changes
    const toggleLabels = {
      noiseReduction: "Noise Reduction",
      saveOriginalAudio: "Save Original Audio",
      autoDeleteAudio: "Auto Delete Audio",
      emailAlerts: "Email Alerts",
      taskCompleted: "Task Completed Notification",
    };
    
    if (toggleLabels[key]) {
      console.log(`${toggleLabels[key]} ${newState ? "enabled" : "disabled"}`);
    }
  };

  const handleChange = (key, value) => {
    if (key === "theme") {
      changeTheme(value);
    }
    setSettings({ ...settings, [key]: value });
    
    // Provide feedback for changes
    const feedbackMessages = {
      recordingQuality: `Recording quality set to ${value}`,
      maxAudioDuration: `Max audio duration set to ${value} minutes`,
      fontSize: `Font size set to ${value}`,
      layout: `Layout changed to ${value}`,
      notificationFrequency: `Notification frequency set to ${value}`,
    };
    
    if (feedbackMessages[key]) {
      console.log(feedbackMessages[key]);
    }
  };

  const handleFeedback = () => {
    setFeedbackModal(true);
    setFeedbackSubmitted(false);
    setFeedbackText("");
  };

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      // Get existing feedback or create new array
      const existingFeedback = JSON.parse(localStorage.getItem("userFeedback") || "[]");
      
      // Create new feedback object
      const newFeedback = {
        id: Date.now(),
        title: feedbackText.substring(0, 50) + (feedbackText.length > 50 ? "..." : ""),
        category: feedbackCategory,
        rating: feedbackRating,
        date: new Date().toISOString().split('T')[0],
        userName: userName,
        text: feedbackText,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      const updatedFeedback = [newFeedback, ...existingFeedback];
      localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
      
      setFeedbackSubmitted(true);
      setFeedbackText("");
      setFeedbackCategory("General Feedback");
      setFeedbackRating(5);
      setTimeout(() => {
        setFeedbackModal(false);
        setFeedbackSubmitted(false);
      }, 2000);
    }
  };

  const handleHelpCenter = () => {
    setHelpCenterModal(true);
    setActiveHelpTab("faq");
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModal(true);
  };

const handleConfirmDelete = async () => {
  try {
    await API.delete("/api/auth/delete-account", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    logout();
    setDeleteAccountModal(false);
    navigate("/login");
  } catch (err) {
    alert(err.response?.data?.error || "Failed to delete account. Please try again.");
    setDeleteAccountModal(false);
  }
};

  const handleCancelDelete = () => {
    setDeleteAccountModal(false);
  };

const handleResetPassword = async () => {
  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    alert("New passwords do not match!");
    return;
  }
  if (resetPasswordForm.newPassword.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }
  try {
    await API.post("/api/auth/change-password", {
      old_password: resetPasswordForm.currentPassword,
      new_password: resetPasswordForm.newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setPasswordResetSuccess(true);
    setTimeout(() => {
      setResetPasswordModal(false);
      setPasswordResetSuccess(false);
      setResetPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 2000);
  } catch (err) {
    alert(err.response?.data?.error || "Failed to reset password. Check your current password.");
  }
};

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className={`${
        theme === 'dark'
          ? 'bg-slate-900/50 border-slate-700'
          : 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-200/50'
      } border rounded-xl p-6`}>
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Settings</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Customize your preferences and manage your account</p>
      </div>

      {/* 1️⃣ PROFILE SECTION */}
      <div className={`rounded-xl p-8 border shadow-sm hover:shadow-md transition ${
        theme === 'dark'
          ? 'bg-slate-900/60 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <span className="text-2xl">👤</span>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Profile</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Manage your personal information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-violet-400/50 object-cover"
              />
              <label htmlFor="profile-pic-input">
                <div className="absolute bottom-0 right-0 bg-violet-500 hover:bg-violet-600 text-white rounded-full p-2 cursor-pointer transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </div>
              </label>
              <input
                id="profile-pic-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Upload Profile Picture</p>
              <p className="text-xs text-gray-500">JPG, PNG or GIF • Max 5MB</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-900 font-semibold mb-2">Full Name</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleNameSave}
                  className="px-4 py-2 bg-green-500/30 border border-green-400 text-green-700 rounded-lg hover:bg-green-500/40 transition"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900">{userName}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className="px-3 py-1 text-sm bg-violet-500/30 border border-violet-400 text-violet-700 rounded hover:bg-violet-500/40 transition"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className={`w-full px-4 py-2 border rounded-lg cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-400 border-slate-600'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
            />
          </div>

          {/* Reset Password */}
          <button
            onClick={() => setResetPasswordModal(true)}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition border ${
              theme === 'dark'
                ? 'bg-orange-600/40 border-orange-500 text-orange-300 hover:bg-orange-600/60'
                : 'bg-orange-500/30 border-orange-400 text-orange-700 hover:bg-orange-500/40'
            }`}
          >
            Reset Password
          </button>
            
          {/* Save Changes */}
          <button
            onClick={async () => {
              try {
                await updateProfile({ profile: { full_name: userName } });
                alert("Changes saved successfully!");
              } catch (err) {
              alert("Failed to save changes.");
              }
            }}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition border ${
            theme === 'dark'
            ? 'bg-green-600/40 border-green-500 text-green-300 hover:bg-green-600/60'
            : 'bg-green-500/30 border-green-400 text-green-700 hover:bg-green-500/40'
             }`}
            >
            Save Changes
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            className="w-full px-6 py-3 bg-red-500/30 border border-red-400 text-red-700 font-semibold rounded-lg hover:bg-red-500/40 transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Recording Quality Removed */}

      {/* NOTIFICATIONS SECTION */}
      <div className={`rounded-xl p-8 border shadow-sm hover:shadow-md transition ${
        theme === 'dark'
          ? 'bg-slate-900/60 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <span className="text-2xl">🔔</span>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Notifications</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Manage alerts and communications</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className={`flex items-center p-3 rounded-lg cursor-pointer border ${
            theme === 'dark'
              ? 'bg-cyan-400/40 border-cyan-300/50 hover:bg-cyan-400/50'
              : 'bg-cyan-50 border-cyan-100'
          }`}>
            <input type="checkbox" checked={settings.emailAlerts} onChange={() => handleToggle("emailAlerts")} className="w-5 h-5 rounded accent-cyan-600" />
            <div className="ml-3 flex-1">
              <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Email Alerts</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Receive email notifications</p>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-lg cursor-pointer border ${
            theme === 'dark'
              ? 'bg-cyan-400/40 border-cyan-300/50 hover:bg-cyan-400/50'
              : 'bg-cyan-50 border-cyan-100'
          }`}>
            <input type="checkbox" checked={settings.taskCompleted} onChange={() => handleToggle("taskCompleted")} className="w-5 h-5 rounded accent-cyan-600" />
            <div className="ml-3 flex-1">
              <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Task Completed</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Alert when analysis is done</p>
            </div>
          </label>

          {/* Notification Frequency */}
          <div>
            <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Notification Frequency</label>
            <select
              value={settings.notificationFrequency}
              onChange={(e) => handleChange("notificationFrequency", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-100 border-slate-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="instant">Instant</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Digest</option>
            </select>
          </div>
        </div>
      </div>

      {/* APPEARANCE SECTION */}
      <div className={`rounded-xl p-8 border shadow-sm hover:shadow-md transition ${
        theme === 'dark'
          ? 'bg-slate-900/60 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <span className="text-2xl">🎨</span>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Appearance</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Customize your interface</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className={`block font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Theme</label>
            <div className="flex gap-3">
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleChange("theme", t.value)}
                  className={`flex-1 py-3 rounded-lg border transition ${
                    settings.theme === t.value
                      ? theme === 'dark'
                        ? 'bg-violet-500/30 border-violet-400 text-slate-100'
                        : 'bg-violet-100 border-violet-300 text-violet-900 font-semibold'
                      : theme === 'dark'
                      ? 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className={`block font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Font Size</label>
            <div className="flex gap-3">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleChange("fontSize", size)}
                  className={`flex-1 py-2 rounded-lg border transition capitalize ${
                    settings.fontSize === size
                      ? theme === 'dark'
                        ? 'bg-violet-500/30 border-violet-400 text-slate-100 font-semibold'
                        : 'bg-violet-100 border-violet-300 text-violet-900 font-semibold'
                      : theme === 'dark'
                      ? 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className={`block font-semibold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Layout</label>
            <div className="flex gap-3">
              {["compact", "comfortable"].map((layout) => (
                <button
                  key={layout}
                  onClick={() => handleChange("layout", layout)}
                  className={`flex-1 py-2 rounded-lg border transition capitalize ${
                    settings.layout === layout
                      ? theme === 'dark'
                        ? 'bg-violet-500/30 border-violet-400 text-slate-100 font-semibold'
                        : 'bg-violet-100 border-violet-300 text-violet-900 font-semibold'
                      : theme === 'dark'
                      ? 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Support & Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback */}
        <div className={`rounded-xl p-6 border shadow-sm ${
          theme === 'dark'
            ? 'bg-slate-900/60 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Send Feedback</h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>Help us improve CrossTalk by sharing your feedback and suggestions.</p>
          <button
            onClick={handleFeedback}
            className={`w-full px-6 py-3 border font-semibold rounded-lg hover:opacity-80 transition flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-purple-600/40 border-purple-500 text-purple-300'
                : 'bg-purple-500/30 border-purple-400 text-purple-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Feedback
          </button>
        </div>

        {/* Help Center */}
        <div className={`rounded-xl p-6 border shadow-sm ${
          theme === 'dark'
            ? 'bg-slate-900/60 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Help Center</h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>Access our documentation, FAQs, and support resources.</p>
          <button
            onClick={handleHelpCenter}
            className={`w-full px-6 py-3 border font-semibold rounded-lg hover:opacity-80 transition flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-purple-600/40 border-purple-500 text-purple-300'
                : 'bg-purple-500/30 border-purple-400 text-purple-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Visit Help Center
          </button>
        </div>
      </div>
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white">
            {feedbackSubmitted ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We appreciate your feedback and will review it soon.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send Us Your Feedback</h3>
                <p className="text-gray-700 text-sm mb-6">Help us improve CrossTalk by sharing your thoughts, suggestions, or reporting issues.</p>
                
                {/* Feedback Category */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:border-violet-400"
                  >
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Feedback">General Feedback</option>
                    <option value="Performance">Performance</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Rating: {feedbackRating} / 5</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`text-3xl transition ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your feedback here..."
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 mb-6 resize-none"
                  rows="6"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className="flex-1 px-4 py-2 bg-purple-500 border border-purple-400 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackModal(false);
                      setFeedbackText("");
                      setFeedbackCategory("General Feedback");
                      setFeedbackRating(5);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500/30 border border-red-400 text-red-700 font-semibold rounded-lg hover:bg-red-500/40 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Help Center Modal (UNCHANGED) */}
      {helpCenterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl border border-gray-200 shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            {/* Header */}
            <div className="sticky top-0 p-6 border-b border-gray-200 flex items-center justify-between bg-white">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help Center
              </h3>
              <button
                onClick={() => setHelpCenterModal(false)}
                className="text-gray-700 hover:text-gray-900 transition text-xl"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-6 border-b border-gray-200 bg-gray-50">
              {["faq", "guides", "contact"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveHelpTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeHelpTab === tab
                      ? "bg-violet-500/40 border border-violet-400 text-violet-700"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {tab === "faq" ? "FAQ" : tab === "guides" ? "Getting Started" : "Contact"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              {activeHelpTab === "faq" && (
              <div className="space-y-4">
              {[
                { q: "What is MUSE?", a: "MUSE is an AI-powered multimodal sentiment and sarcasm detection system designed to analyze customer support calls by detecting Sentiment, Sarcasm, and Emotional Intent through Voice, Tone, and Language." },
                { q: "How do I analyze a call?", a: "Simply navigate to the \"Analyze Call\" section, upload your audio file, select source and target language, and our AI will analyze it for sentiment, sarcasm, tone, and more. Results will appear within seconds." },
                { q: "Can I download my analysis results?", a: "Yes! You can download individual results from the History page as a PDF report containing full transcript, sentiment, sarcasm score, tone, and translation." },
                { q: "What file formats are supported?", a: "We support MP3, WAV, M4A, OGG, AAC and FLAC formats. Maximum file size is 16MB per upload." },
                { q: "How are my files stored?", a: "Your analysis results are securely stored in our database and are private and accessible only to your account. You can delete any analysis from your History at any time." },
                  ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
              <p className="text-gray-700">{item.a}</p>
              </div>
              ))}
            </div>
      )}
              {activeHelpTab === "guides" && (
                <div className="space-y-4">
                  {[
                    { num: "1", title: "Create Your Account", desc: "Sign up with your email and create a secure password. You'll receive a verification email to confirm your account." },
                    { num: "2", title: "Upload Your First Call", desc: "Go to Dashboard and click \"Analyze Call\". Upload an audio file or paste a link. Our AI will start analyzing immediately." },
                    { num: "3", title: "View Your Results", desc: "Once analysis is complete, view detailed insights including sentiment scores, tone analysis, key topics, and transcription summaries." },
                    { num: "4", title: "Customize Your Settings", desc: "Visit Settings to update your profile, change theme preferences, reset your password, or send us feedback." },
                    { num: "5", title: "Track Your History", desc: "Access all your past analyses from the History page. Search, filter, and manage all your call insights in one place." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.num}. {item.title}</h4>
                      <p className="text-gray-700">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeHelpTab === "contact" && (
                <div className="space-y-4">
                  {[
                    { title: "Email Support", email: "support@crosstalk.com", desc: "Our support team typically responds within 24 hours." },
                    { title: "Live Chat", email: "Monday-Friday, 9 AM - 6 PM EST", desc: "Chat directly with our support team through the chat widget in the app." },
                    { title: "Report an Issue", email: "", desc: "Use the \"Send Feedback\" section to report bugs or issues. Include as much detail as possible to help us resolve it quickly." },
                    { title: "Documentation", email: "docs.crosstalk.com", desc: "Visit our online documentation for detailed API references and advanced features." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      {item.email && <p className="text-gray-700 mb-1">{item.email}</p>}
                      <p className="text-gray-700">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm w-full max-w-md bg-white">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 text-center mb-2">Delete Account?</h3>
              <p className="text-gray-600 text-center">This action is permanent and cannot be undone. All your data will be deleted.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleConfirmDelete}
                className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={handleCancelDelete}
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-8 border shadow-sm w-full max-w-md ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-gray-200'
          }`}>
            {!passwordResetSuccess ? (
              <>
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-orange-500/20 border border-orange-400 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-3xl">🔐</span>
                  </div>
                  <h3 className={`text-2xl font-semibold text-center mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Reset Password</h3>
                  <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Enter your current and new password</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Current Password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.currentPassword}
                      onChange={(e) => setResetPasswordForm({...resetPasswordForm, currentPassword: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-100 border-slate-600'
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>New Password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.newPassword}
                      onChange={(e) => setResetPasswordForm({...resetPasswordForm, newPassword: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-100 border-slate-600'
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Confirm Password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.confirmPassword}
                      onChange={(e) => setResetPasswordForm({...resetPasswordForm, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-100 border-slate-600'
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleResetPassword}
                    className={`w-full px-4 py-3 font-semibold rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => setResetPasswordModal(false)}
                    className={`w-full px-4 py-3 font-semibold rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className={`w-16 h-16 bg-green-500/20 border border-green-400 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Password Reset Successful</h3>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Your password has been updated successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

}














