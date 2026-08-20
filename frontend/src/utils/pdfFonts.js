// Load font as base64 and register with jsPDF
export const loadNotoFonts = async (doc) => {
  const fonts = [
    { name: "NotoSansDevanagari", file: "/fonts/NotoSansDevanagari.b64" },
    { name: "NotoSansTelugu", file: "/fonts/NotoSansTelugu.b64" },
    { name: "NotoSansTamil", file: "/fonts/NotoSansTamil.b64" },
    { name: "NotoSansKannada", file: "/fonts/NotoSansKannada.b64" },
    { name: "NotoSansMalayalam", file: "/fonts/NotoSansMalayalam.b64" },
  ];

  for (const font of fonts) {
    const response = await fetch(font.file);
    const base64 = await response.text();
    doc.addFileToVFS(`${font.name}-Regular.ttf`, base64);
    doc.addFont(`${font.name}-Regular.ttf`, font.name, "normal");
  }
};

// Detect which font to use based on text content
export const getFontForText = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return "NotoSansDevanagari"; // Hindi/Marathi
  if (/[\u0C00-\u0C7F]/.test(text)) return "NotoSansTelugu";     // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return "NotoSansTamil";      // Tamil
  if (/[\u0C80-\u0CFF]/.test(text)) return "NotoSansKannada";    // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "NotoSansMalayalam";  // Malayalam
  return "helvetica"; // Default for English
};