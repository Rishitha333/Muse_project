import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Logo from "../components/Logo";
import { ThemeContext } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen text-white overflow-hidden ${
      isDark 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
        : "bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700"
    }`}>
      {/* Header with Theme Toggle */}
      <div className="absolute top-0 right-0 p-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 min-h-screen items-center">

        {/* LEFT — STORY */}
        <div className="z-10">
          <Logo size="xl" theme="dark" />

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mt-8 mb-6">
            Hear Beyond <br />
            <span className="text-violet-200">Customer Words</span>
          </h1>

          <p className="text-xl opacity-90 mb-10 max-w-xl">
MUSE detects sentiment and sarcasm in customer support calls by analysing
voice and language together — catching the cases where tone and words disagree.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className={`h-11 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-transparent shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50"
                  : "bg-white text-purple-700 hover:shadow-lg hover:scale-105"
              }`}
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/register")}
              className={`h-11 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-transparent shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50"
                  : "bg-white text-purple-700 hover:shadow-lg hover:scale-105"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* RIGHT — AI EMOTION CANVAS */}
        <div className="relative h-[500px] flex items-center justify-center">

          {/* Central Wave */}
          <div className="absolute w-[380px] h-[380px] rounded-full bg-gray-100 text-gray-800 backdrop-blur-2xl animate-pulse" />

          {/* Floating Emotions */}
          <div className="absolute top-10 left-16 text-5xl animate-bounce">😡</div>
          <div className="absolute top-24 right-20 text-5xl animate-pulse">😏</div>
          <div className="absolute bottom-24 left-20 text-5xl animate-bounce">😐</div>
          <div className="absolute bottom-10 right-24 text-5xl animate-pulse">😊</div>

          {/* Headphone / Mic Icon */}
          <div className="text-[140px] opacity-90">🎧</div>

        </div>
      </div>
    </div>
  );
}










