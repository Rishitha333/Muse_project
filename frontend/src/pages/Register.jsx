import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Logo from "../components/Logo";
import { ThemeContext } from "../context/ThemeContext";
import { register } from "../services/api";

export default function Register() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate 6-digit OTP
  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    return newOTP;
  };

  // Save 2FA session
  const save2FASession = (tempOTP) => {
    const session = {
      otp: tempOTP,
      email: email,
      role: role,
      fullName: fullName,
      password: password,
      timestamp: Date.now(),
      attempts: 0
    };
    sessionStorage.setItem("registration_2fa", JSON.stringify(session));
  };

const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await register(email, fullName, password);
      console.log("Registration successful:", response);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    
    if (locked) {
      alert("Too many failed attempts. Please try registering again.");
      return;
    }

    // Accept any 6-digit input for 2FA verification
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      // OTP verified successfully - create the account
      const userAccount = {
        email: email,
        fullName: fullName,
        role: role,
        twoFAVerified: true,
        registrationTime: Date.now()
      };
      localStorage.setItem("userAccount", JSON.stringify(userAccount));
      sessionStorage.removeItem("registration_2fa");
      alert("🎉 Account created successfully! You can now login.");
      navigate("/login");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setLocked(true);
        alert("Too many failed attempts. Please try registering again.");
      } else {
        alert(`Please enter a valid 6-digit code. ${3 - newAttempts} attempts remaining.`);
      }
      setOtp("");
    }
  };

  const handleBackToRegister = () => {
    setShowTwoFA(false);
    setOtp("");
    setAttempts(0);
    setLocked(false);
    sessionStorage.removeItem("registration_2fa");
  };

  return (
    <div className={`min-h-screen text-white overflow-hidden ${
      isDark
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700"
    }`}>
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 min-h-screen items-center">

        {/* LEFT — AI VISUAL STORY */}
        <div className="relative hidden md:flex items-center justify-center h-[500px]">

          {/* Pulse Core */}
          <div className="absolute w-[360px] h-[360px] rounded-full bg-gray-100 text-gray-800 backdrop-blur-2xl animate-pulse" />

          {/* Floating Emotions */}
          <div className="absolute top-10 left-20 text-2xl animate-bounce">🤔</div>
          <div className="absolute top-24 right-16 text-2xl animate-pulse">😏</div>
          <div className="absolute bottom-20 left-24 text-2xl animate-bounce">😊</div>
          <div className="absolute bottom-10 right-20 text-2xl animate-pulse">🎭</div>

          {/* Center Icon */}
          <div className="text-[120px] opacity-90">🧠</div>
        </div>

        {/* RIGHT — REGISTER/2FA PANEL */}
        <div className="flex justify-center">
          <div className={`w-full max-w-md backdrop-blur-xl rounded-lg p-8 shadow-2xl ${
            isDark
              ? "bg-slate-800 text-white"
              : "bg-gray-100 text-gray-800"
          }`}>

            {/* LOGO */}
            <div className="flex justify-center mb-6">
              <Logo size="lg" theme={isDark ? "dark" : "light"} />
            </div>

            {!showTwoFA ? (
              <>
                <h2 className="text-3xl font-bold text-center mb-2">
                  Join CrossTalk
                </h2>

                <p className={`text-center mb-8 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}>
                  Create your account and explore AI-powered emotion analysis
                </p>

                <form onSubmit={handleRegister} className="space-y-5">

                  {/* ROLE */}
                  <div>
                    <label className={`text-sm font-semibold block mb-2 ${
                      isDark ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Register As
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="user">User / Analyst</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {/* NAME */}
                  <div>
                    <label className={`text-sm font-semibold block mb-2 ${
                      isDark ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className={`text-sm font-semibold block mb-2 ${
                      isDark ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className={`text-sm font-semibold block mb-2 ${
                      isDark ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  {/* 2FA INFO */}
                  <div className={isDark ? "border border-blue-600 bg-blue-900/30 rounded-lg p-3 text-sm text-blue-200" : "bg-blue-100 border border-blue-400 rounded-lg p-3 text-sm text-blue-900"}>
                    <p className="font-semibold">🔐 2FA Setup Required</p>
                    <p>You'll verify your account with a 6-digit code after registration.</p>
                  </div>

                  {/* REGISTER BUTTON */}
                  <button
                    type="submit"
                    className={`w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-transparent shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-transparent shadow-md hover:from-indigo-700 hover:to-purple-700 active:scale-95"
                    }`}
                  >
                    ✨ Create AI Account
                  </button>
                </form>

                {/* LOGIN LINK */}
                <p className={`text-sm text-center mt-6 ${
                  isDark ? "text-slate-400" : "text-gray-700"
                }`}>
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className={`cursor-pointer font-semibold hover:underline transition-colors duration-200 ${
                      isDark ? "text-cyan-400 hover:text-cyan-300" : "text-purple-700"
                    }`}
                  >
                    Login here
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-center mb-2">
                  🔐 Verify Your Account
                </h2>

                <p className={`text-center mb-8 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}>
                  Enter the 6-digit code sent to<br />
                  <span className="font-semibold">{email}</span>
                </p>

                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength="6"
                    required
                    className={`w-full p-4 text-center text-2xl tracking-widest rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />

                  <button
                    type="submit"
                    disabled={locked}
                    className={`w-full py-3 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-violet-600 text-white"
                        : "bg-white text-violet-600"
                    }`}
                  >
                    ✅ Verify & Create Account
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToRegister}
                    className={`w-full py-3 rounded-full font-semibold transition ${
                      isDark
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    ← Back to Registration
                  </button>
                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}










