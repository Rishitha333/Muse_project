import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Logo from "../components/Logo";
import { ThemeContext } from "../context/ThemeContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const handleReset = (e) => {
    e.preventDefault();
    // backend integration later
    navigate("/login");
  };

  return (
    <div className={`min-h-screen text-white overflow-hidden ${
      isDark
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-purple-700 via-purple-600 to-violet-500"
    }`}>
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 min-h-screen items-center">

        {/* LEFT — CONFIRMATION VISUAL */}
        <div className="relative hidden md:flex items-center justify-center h-[500px]">

          {/* Pulse */}
          <div className="absolute w-[340px] h-[340px] rounded-full bg-gray-100 text-gray-800 backdrop-blur-2xl animate-pulse" />

          {/* Floating Icons */}
          <div className="absolute top-16 left-20 text-2xl animate-bounce">🔐</div>
          <div className="absolute top-24 right-20 text-2xl animate-pulse">✨</div>
          <div className="absolute bottom-20 left-24 text-2xl animate-pulse">🧠</div>
          <div className="absolute bottom-12 right-24 text-2xl animate-bounce">✅</div>

          {/* Center Icon */}
          <div className="text-[120px] opacity-90">🔓</div>
        </div>

        {/* RIGHT — RESET PANEL */}
        <div className="flex justify-center">
          <div className={`w-full max-w-md backdrop-blur-xl rounded-lg p-8 shadow-2xl ${isDark ? "bg-slate-800/80 text-gray-100" : "bg-gray-100 text-gray-800"}`}>

            {/* LOGO */}
            <div className="flex justify-center mb-6">
              <Logo size="lg" theme={isDark ? "dark" : "light"} />
            </div>

            <h2 className={`text-3xl font-bold text-center mb-3 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
              Set New Password
            </h2>

            <p className={`text-center mb-8 ${isDark ? "text-gray-400" : "text-gray-700"}`}>
              Choose a strong password to secure your CrossTalk Sentiment
              account.
            </p>

            <form onSubmit={handleReset} className="space-y-5">

              {/* NEW PASSWORD */}
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? "text-gray-300" : "text-black"}`}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className={`w-full p-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${isDark ? "bg-slate-700 border-slate-600 text-gray-100" : "bg-white border-gray-300 text-black"}`}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? "text-gray-300" : "text-black"}`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className={`w-full p-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${isDark ? "bg-slate-700 border-slate-600 text-gray-100" : "bg-white border-gray-300 text-black"}`}
                />
              </div>

              {/* RESET BUTTON */}
              <button
                type="submit"
                className={`w-full h-11 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-transparent shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-transparent shadow-md hover:from-indigo-700 hover:to-purple-700 active:scale-95"
                }`}
              >
                Reset & Login
              </button>
            </form>

            {/* BACK */}
            <p
              onClick={() => navigate("/login")}
              className={`text-sm text-center cursor-pointer mt-6 hover:underline font-semibold ${isDark ? "text-cyan-400" : "text-purple-700"}`}
            >
              ← Back to Login
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}










