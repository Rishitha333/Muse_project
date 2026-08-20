import logo from "../assets/logo.png";

export default function Logo({ size = "md", showText = true, theme = "light" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const accentColor = theme === "dark" ? "#00d9ff" : "#6366f1";
  const subtitleColor = theme === "dark" ? "#00d9ff" : "#6366f1";

  // Adjust font sizes based on logo size
  const fontSizes = {
    sm: { title: "16px", subtitle: "10px" },
    md: { title: "24px", subtitle: "11px" },
    lg: { title: "26px", subtitle: "12px" },
    xl: { title: "28px", subtitle: "12px" },
  };

  return (
    <div className="flex items-center gap-2">
      {/* ROUND LOGO */}
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center relative flex-shrink-0`}
        
      >
        <img
          src={logo}
          alt="MUSE Logo"
          className="w-[92%] h-[92%] rounded-full object-cover"
        />
      </div>

      {/* TEXT */}
      {showText && (
        <div className="leading-tight">
          <h1 
            className={`font-black tracking-widest ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            style={{ 
              fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial",
              letterSpacing: "0.08em",
              fontWeight: 700,
              textTransform: "uppercase",
              borderBottom: `3px solid ${accentColor}`,
              paddingBottom: "2px",
              display: "inline-block",
              fontSize: fontSizes[size].title,
              color: textColor
            }}
          >
            MUSE
          </h1>
          <p 
            className="font-medium whitespace-nowrap mt-0.5"
            style={{ 
              fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial",
              letterSpacing: "0.05em",
              fontWeight: 700,
              fontSize: fontSizes[size].subtitle,
              color: subtitleColor
            }}
          >
            Beyond words into emotions
          </p>
        </div>
      )}
    </div>
  );
}








