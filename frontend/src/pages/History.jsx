import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { getHistory, deleteHistory, isAuthenticated } from "../services/api";
import { loadNotoFonts, getFontForText } from "../utils/pdfFonts";

export default function History() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getHistory(1, 20);

        const transformed = response.history.map((item) => ({
          id: item._id,
          callId: item.call_id || item._id,
          date: new Date(item.timestamp).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
          }),
          time: new Date(item.timestamp).toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit"
          }),
          timestamp: item.timestamp,
          language: `${item.detected_language || item.input?.source_lang || "Unknown"} → ${item.target_language || item.input?.target_lang || "English"}`,
          sentiment: item.text?.sentiment || "N/A",
          sentimentType: (item.text?.sentiment || "neutral").toLowerCase(),
          sarcasm: item.results?.final_sarcasm_score?.toFixed(3) || "N/A",
          tone: item.audio?.tone || "N/A",
          originalText: item.transcript || "",
          translatedText: item.translated_transcript || "",
          sttConfidence: item.results?.stt_confidence ? (item.results.stt_confidence * 100).toFixed(0) + "%" : "N/A",
          translationConfidence: item.results?.translation_confidence ? (item.results.translation_confidence * 100).toFixed(0) + "%" : "N/A",
        }));

        setHistoryData(transformed);
        setError(null);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.response?.data?.error || "Failed to load history");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredData = historyData.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    if (filterType) {
      switch (filterType) {
        case "date": return item.date.toLowerCase().includes(query);
        case "sentiment": return item.sentiment.toLowerCase().includes(query);
        case "tone": return item.tone.toLowerCase().includes(query);
        case "callId": return item.callId.toLowerCase().includes(query);
        default: return true;
      }
    }
    return (
      item.callId.toLowerCase().includes(query) ||
      item.date.toLowerCase().includes(query) ||
      item.sentiment.toLowerCase().includes(query) ||
      item.tone.toLowerCase().includes(query) ||
      item.language.toLowerCase().includes(query)
    );
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((item) => item.id));
    }
  };

  const handleCancel = () => {
    setSelectedItems([]);
    setShowCheckboxes(false);
  };

  const downloadSelectedPDFs = () => {
    selectedItems.forEach((id) => {
      const item = historyData.find((d) => d.id === id);
      if (item) downloadSinglePDF(item);
    });
  };

  /* ---------------- SINGLE REPORT PDF ---------------- */
  const downloadSinglePDF = async (item) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 0;

    await loadNotoFonts(doc);

    // HEADER
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("MUSE - CALL ANALYSIS REPORT", 15, 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Multimodal Sentiment & Sarcasm Intelligence", 15, 24);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, 24);
    y = 45;

    // CALL INFORMATION
    doc.setFillColor(245, 243, 255);
    doc.rect(10, y - 5, pageWidth - 20, 38, "F");
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.rect(10, y - 5, pageWidth - 20, 38, "S");
    doc.setFontSize(11);
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.text("CALL INFORMATION", 15, y + 2);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Call ID:`, 15, y); doc.setFont("helvetica", "bold"); doc.text(`${item.callId}`, 45, y); doc.setFont("helvetica", "normal");
    doc.text(`Date:`, 110, y); doc.setFont("helvetica", "bold"); doc.text(`${item.date} ${item.time}`, 125, y); doc.setFont("helvetica", "normal");
    y += 6;
    const languageText = item.language.replace("→", "->"); 
    doc.text(`Language:`, 15, y); doc.setFont("helvetica", "bold"); doc.text(languageText, 45, y);
    doc.text(`Status:`, 110, y); doc.setFont("helvetica", "bold"); doc.setTextColor(22, 163, 74); doc.text(`Completed`, 125, y); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
    y += 6;
    doc.text(`Tone:`, 15, y); doc.setFont("helvetica", "bold"); doc.text(`${item.tone || "N/A"}`, 45, y); doc.setFont("helvetica", "normal");
    y += 14;

    // AI ANALYSIS RESULTS
    doc.setFillColor(245, 243, 255);
    doc.rect(10, y - 5, pageWidth - 20, 38, "F");
    doc.setDrawColor(139, 92, 246);
    doc.rect(10, y - 5, pageWidth - 20, 38, "S");
    doc.setFontSize(11);
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.text("AI ANALYSIS RESULTS", 15, y + 2);
    y += 8;

    const sentimentColor = item.sentimentType === "negative" ? [220, 38, 38] :
                           item.sentimentType === "positive" ? [22, 163, 74] : [234, 179, 8];
    doc.setFillColor(...sentimentColor);
    doc.roundedRect(15, y - 3, 45, 10, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${item.sentiment}`, 37, y + 4, { align: "center" });

    doc.setFillColor(109, 40, 217);
    doc.roundedRect(65, y - 3, 55, 10, 2, 2, "F");
    doc.text(`Sarcasm: ${item.sarcasm}`, 92, y + 4, { align: "center" });

    const sarcasmLevel = parseFloat(item.sarcasm) > 0.6 ? "High" :
                         parseFloat(item.sarcasm) > 0.3 ? "Moderate" : "Low";
    doc.setFillColor(15, 118, 110);
    doc.roundedRect(125, y - 3, 55, 10, 2, 2, "F");
    doc.text(`Level: ${sarcasmLevel}`, 152, y + 4, { align: "center" });
    y += 16;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`STT Accuracy: ${item.sttConfidence || "N/A"}`, 15, y);
    doc.text(`Translation Accuracy: ${item.translationConfidence || "N/A"}`, 80, y);
    y += 14;

    // TRANSCRIPTS HEADER
    // Calculate total transcript height first
    const previewOrigText = item.originalText || "No transcript available";
    doc.setFont(getFontForText(previewOrigText), "normal");
    const origLinesPreview = doc.splitTextToSize(`"${previewOrigText}"`, 160);

    const previewTransText = item.translatedText || "No translation available";
    doc.setFont(getFontForText(previewTransText), "normal");
    const transLinesPreview = doc.splitTextToSize(`"${previewTransText}"`, 160);

    const transcriptBoxHeight = 30 + origLinesPreview.length * 4 + transLinesPreview.length * 4;

    // Draw outer box around entire transcripts section
    doc.setFillColor(245, 243, 255);
    doc.rect(10, y - 5, pageWidth - 20, transcriptBoxHeight, "F");
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.rect(10, y - 5, pageWidth - 20, transcriptBoxHeight, "S");

    // Header
    doc.setFontSize(11);
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSCRIPTS", 15, y + 1);
    y += 10;

    // Original Transcript
    doc.setFontSize(9);
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.text("Original Transcript:", 15, y); y += 5;

    const origText = item.originalText || "No transcript available";
    const origFont = getFontForText(origText);
    doc.setFont(origFont, "normal");
    doc.setTextColor(50, 50, 50);
    const origLines = doc.splitTextToSize(`"${origText}"`, 170);
    if (y + origLines.length * 4 > pageHeight - 30) { doc.addPage(); y = 20; }
    doc.setFillColor(249, 250, 251);
    doc.rect(12, y - 3, pageWidth - 24, origLines.length * 4 + 4, "F");
    doc.text(origLines, 15, y);
    doc.setFont("helvetica", "normal");
    y += origLines.length * 4 + 8;

    // Translated Transcript
    doc.setFontSize(9);
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.text(`Translated Transcript (${item.language?.split("→")[1]?.trim() || "English"}):`, 15, y); y += 5;

    const translatedText = item.translatedText || "No translation available";
    const translatedFont = getFontForText(translatedText);
    doc.setFont(translatedFont, "normal");
    doc.setTextColor(50, 50, 50);
    const transLines = doc.splitTextToSize(`"${translatedText}"`, 170);
    if (y + transLines.length * 4 > pageHeight - 30) { doc.addPage(); y = 20; }
    doc.setFillColor(249, 250, 251);
    doc.rect(12, y - 3, pageWidth - 24, transLines.length * 4 + 4, "F");
    doc.text(transLines, 15, y);
    doc.setFont("helvetica", "normal");
    y += transLines.length * 4 + 8;

    // NOTES
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    const noteLines = doc.splitTextToSize("This is an automated analysis report generated by MUSE - Multimodal Sentiment & Sarcasm Intelligence System.", 170);
    doc.text(noteLines, 15, y);

    // FOOTER
    doc.setFillColor(88, 28, 135);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text(`MUSE Report | ${item.callId}`, 15, pageHeight - 6);
    doc.text(`${new Date().toLocaleString()}`, pageWidth - 65, pageHeight - 6);

    doc.save(`MUSE_Report_${item.callId}.pdf`);
  };

  /* ---------------- OVERALL REPORT PDF ---------------- */
  const downloadOverallPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("MUSE - OVERALL CALL ANALYSIS REPORT", 15, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;

    doc.setFontSize(11);
    doc.text("REPORT SUMMARY", 15, y);
    y += 4;
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Calls Analyzed: ${historyData.length}`, 15, y); y += 6;
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, y); y += 10;

    const negativeCount = historyData.filter(d => d.sentimentType === 'negative').length;
    const positiveCount = historyData.filter(d => d.sentimentType === 'positive').length;
    const neutralCount = historyData.filter(d => d.sentimentType === 'neutral').length;
    const validSarcasm = historyData.filter(d => !isNaN(parseFloat(d.sarcasm)));
    const avgSarcasm = validSarcasm.length > 0
      ? (validSarcasm.reduce((sum, d) => sum + parseFloat(d.sarcasm), 0) / validSarcasm.length).toFixed(3)
      : "N/A";

    doc.text(`Negative Sentiment: ${negativeCount}`, 15, y); y += 5;
    doc.text(`Positive Sentiment: ${positiveCount}`, 15, y); y += 5;
    doc.text(`Neutral Sentiment: ${neutralCount}`, 15, y); y += 5;
    doc.text(`Average Sarcasm Score: ${avgSarcasm}`, 15, y); y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("DETAILED CALL RECORDS", 15, y);
    y += 4;
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    historyData.forEach((item, index) => {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Call ${index + 1}: ${item.callId}`, 15, y); y += 5;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`Date: ${item.date}`, 15, y); y += 4;
      doc.text(`Language: ${item.language}`, 15, y); y += 4;
      doc.text(`Sentiment: ${item.sentiment}`, 15, y); y += 4;
      doc.text(`Sarcasm: ${item.sarcasm}`, 15, y); y += 4;
      doc.text(`Tone: ${item.tone}`, 15, y); y += 8;

      doc.setFontSize(8);
      doc.text("Original Transcript:", 15, y); y += 3;
      const origLines = doc.splitTextToSize(`"${item.originalText}"`, 165);
      doc.text(origLines, 15, y);
      y += origLines.length * 3 + 3;

      doc.text("Translated Transcript:", 15, y); y += 3;
      const isNonLatin = /[^\u0000-\u007F]/.test(item.translatedText);
      if (isNonLatin) {
        doc.setTextColor(146, 64, 14);
        doc.text("(Non-Latin text - view in MUSE web app)", 15, y);
        doc.setTextColor(50, 50, 50);
      } else {
        const transLines = doc.splitTextToSize(`"${item.translatedText}"`, 165);
        doc.text(transLines, 15, y);
        y += transLines.length * 3;
      }
      y += 6;
      doc.setLineWidth(0.2);
      doc.line(15, y, pageWidth - 15, y);
      y += 4;
    });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, doc.internal.pageSize.getHeight() - 10);
    doc.text(`MUSE Overall Report`, pageWidth - 50, doc.internal.pageSize.getHeight() - 10);
    doc.save("MUSE_Overall_Report.pdf");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
      </div>

      <div className="flex gap-4 mb-6 items-end">
        <div className="flex-1 flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="text-xl text-gray-500">🔍</div>
          <input
            type="text"
            placeholder="Enter search term..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent outline-none text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border-2 border-violet-400 bg-transparent text-violet-700 dark:text-violet-400 rounded-lg focus:outline-none cursor-pointer font-semibold"
        >
          <option value="" style={{backgroundColor: "#1f2937", color: "#fff"}}>All Fields</option>
          <option value="callId" style={{backgroundColor: "#1f2937", color: "#fff"}}>Call ID</option>
          <option value="date" style={{backgroundColor: "#1f2937", color: "#fff"}}>Date</option>
          <option value="sentiment" style={{backgroundColor: "#1f2937", color: "#fff"}}>Sentiment</option>
          <option value="tone" style={{backgroundColor: "#1f2937", color: "#fff"}}>Tone</option>
        </select>
        <button
          onClick={() => { setShowCheckboxes(true); setSelectedItems(filteredData.map((item) => item.id)); }}
          className={`px-6 py-2 font-semibold rounded-lg transition whitespace-nowrap border ${
            theme === "dark" ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700" : "bg-blue-500 border-blue-400 text-white hover:bg-blue-600"
          }`}
        >
          Select
        </button>
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setFilterType(""); }}
            className={`px-6 py-2 font-semibold rounded-lg transition whitespace-nowrap border ${
              theme === "dark" ? "bg-red-600 border-red-500 text-white hover:bg-red-700" : "bg-red-500 border-red-400 text-white hover:bg-red-600"
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {searchQuery && filterType && (
        <div className={`mb-4 p-3 rounded-lg text-sm border ${
          theme === "dark" ? "bg-purple-500/10 border-purple-400/30 text-purple-300" : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          Searching for: <span className="font-semibold">"{searchQuery}"</span>
          <span className="ml-2">in <span className="font-semibold capitalize">{filterType}</span></span>
          {` (${filteredData.length} result${filteredData.length !== 1 ? 's' : ''})`}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mb-6 flex gap-3">
          <button onClick={downloadSelectedPDFs} className={`px-6 py-2 font-semibold rounded-lg transition ${theme === "dark" ? "bg-green-600/40 border border-green-500 text-green-300 hover:bg-green-600/60" : "bg-green-500/30 border border-green-400 text-green-700 hover:bg-green-500/40"}`}>
            Download Selected ({selectedItems.length})
          </button>
          <button onClick={handleCancel} className={`px-6 py-2 font-semibold rounded-lg transition ${theme === "dark" ? "bg-red-600/40 border border-red-500 text-red-300 hover:bg-red-600/60" : "bg-red-500/30 border border-red-400 text-red-700 hover:bg-red-500/40"}`}>
            Cancel Selection
          </button>
        </div>
      )}

      <div className="rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm overflow-x-auto bg-white dark:bg-slate-900">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`border-b ${theme === "dark" ? "border-slate-700 text-slate-200" : "border-gray-200 text-gray-900"}`}>
              {showCheckboxes && <th className="px-6 py-4 text-left"><input type="checkbox" checked={selectedItems.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} className="w-4 h-4" /></th>}
              <th className="px-6 py-4 text-left font-bold">Call ID</th>
              <th className="px-6 py-4 text-left font-bold">Timestamp</th>
              <th className="px-6 py-4 text-left font-bold">Language</th>
              <th className="px-6 py-4 text-left font-bold">Sentiment</th>
              <th className="px-6 py-4 text-left font-bold">Sarcasm</th>
              <th className="px-6 py-4 text-left font-bold">Tone</th>
              <th className="px-6 py-4 text-left font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const sentimentColors = {
                negative: "text-red-700 bg-red-500/10 border border-red-400/30",
                positive: "text-green-700 bg-green-500/10 border border-green-400/30",
                neutral: "text-yellow-700 bg-yellow-500/10 border border-yellow-400/30",
              };
              return (
                <tr key={item.id} className={`border-b ${theme === "dark" ? "border-slate-700 dark:hover:bg-slate-700" : "border-gray-100 hover:bg-gray-50"} text-gray-800 dark:text-gray-200 transition`}>
                  {showCheckboxes && <td className="px-6 py-4"><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} className="w-4 h-4" /></td>}
                  <td className="px-6 py-4 text-violet-700 dark:text-cyan-400 font-mono font-bold text-sm cursor-pointer hover:underline" onClick={() => setSelectedAudio(item)}>{item.callId}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200 text-sm">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200">{item.language}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${sentimentColors[item.sentimentType]}`}>{item.sentiment}</span>
                  </td>
                  <td className="px-6 py-4 text-violet-700 dark:text-cyan-400 font-medium">{item.sarcasm}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200">{item.tone}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => downloadSinglePDF(item)} className={`px-3 py-1 rounded text-sm transition font-semibold ${theme === "dark" ? "bg-violet-600/40 border border-violet-500 text-violet-300 hover:bg-violet-600/60" : "bg-violet-400/30 border border-violet-400 text-violet-700 hover:bg-violet-400/50"}`}>
                      Download
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"} border rounded-lg shadow-lg p-8 max-w-md w-full`}>
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Call Detail</h3>
            <div className="mb-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg space-y-2">
              <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Call ID: {selectedAudio.callId}</p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{selectedAudio.date} {selectedAudio.time}</p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Language: {selectedAudio.language}</p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Sentiment: {selectedAudio.sentiment} | Sarcasm: {selectedAudio.sarcasm} | Tone: {selectedAudio.tone}</p>
              {selectedAudio.originalText && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                  <p className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Original Transcript:</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{selectedAudio.originalText}</p>
                </div>
              )}
              {selectedAudio.translatedText && selectedAudio.translatedText !== selectedAudio.originalText && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-slate-600">
                  <p className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Translated Transcript:</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{selectedAudio.translatedText}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedAudio(null)} className={`w-full px-4 py-2 font-semibold rounded-lg transition ${theme === "dark" ? "bg-violet-600 text-white hover:bg-violet-700 border border-violet-500" : "bg-violet-500 text-white hover:bg-violet-600 border border-violet-400"}`}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}