import { useLocation } from "react-router-dom";
import { useCall } from "../context/useCall";

export default function Results() {
  const { currentCallId } = useCall();
  const location = useLocation();
  const state = location.state || {};

  // Read real data from navigation state
  const {
    callId: stateCallId,
    transcript,
    translatedTranscript,
    finalSarcasmScore,
    tone,
    sentiment,
    sttConfidence,
    translationConfidence,
    targetLang,
    sourceLang,
  } = state;

  const callId = stateCallId || currentCallId || "N/A";
  const sttAccuracy = sttConfidence ? (sttConfidence * 100).toFixed(0) + "%" : "N/A";
  const translationAccuracy = translationConfidence ? (translationConfidence * 100).toFixed(0) + "%" : "N/A";
  const sarcasmScore = finalSarcasmScore ? finalSarcasmScore.toFixed(2) : "N/A";

  const sentimentEmoji = {
    negative: "😡",
    positive: "😊",
    neutral: "😐",
  };

  const toneEmoji = {
    frustrated: "😤",
    happy: "😊",
    sad: "😢",
    angry: "😠",
    neutral: "😐",
  };

  const sentimentColor = {
    negative: "text-red-700",
    positive: "text-green-700",
    neutral: "text-yellow-700",
  };

  const sentimentKey = (sentiment || "neutral").toLowerCase();
  const toneKey = (tone || "neutral").toLowerCase();

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analysis Results
        </h1>
        <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-400/30 rounded-lg w-fit">
          <p className="text-purple-700 text-sm font-semibold">Call ID:</p>
          <p className="text-violet-400 font-mono font-bold">{callId}</p>
          <button
            onClick={() => navigator.clipboard.writeText(callId)}
            className="ml-2 px-2 py-1 bg-violet-500/20 border border-violet-400 text-violet-700 rounded text-xs hover:bg-violet-500/30 transition"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Accuracy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white">
          <p className="text-gray-400 mb-2">🎙 Speech-to-Text Accuracy</p>
          <h2 className="text-4xl font-bold text-green-700 animate-pulse">
            {sttAccuracy}
          </h2>
        </div>
        <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white">
          <p className="text-gray-400 mb-2">🌐 Translation Accuracy</p>
          <h2 className="text-4xl font-bold text-purple-700 animate-pulse">
            {translationAccuracy}
          </h2>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-xl p-6 border border-gray-200 text-center hover:scale-105 transition shadow-sm bg-white">
          <p className="text-gray-400 mb-2">Sentiment</p>
          <div className="text-4xl mb-2 animate-bounce">
            {sentimentEmoji[sentimentKey] || "😐"}
          </div>
          <h2 className={`text-2xl font-bold ${sentimentColor[sentimentKey] || "text-yellow-700"}`}>
            {sentiment || "N/A"}
          </h2>
        </div>

        <div className="rounded-xl p-6 border border-gray-200 text-center hover:scale-105 transition shadow-sm bg-white">
          <p className="text-gray-400 mb-2">Sarcasm Score</p>
          <div className="text-4xl mb-2 animate-bounce">😏</div>
          <h2 className="text-3xl font-bold text-purple-700">
            {sarcasmScore}
          </h2>
        </div>

        <div className="rounded-xl p-6 border border-gray-200 text-center hover:scale-105 transition shadow-sm bg-white">
          <p className="text-gray-400 mb-2">Tone Detected</p>
          <div className="text-4xl mb-2 animate-bounce">
            {toneEmoji[toneKey] || "😐"}
          </div>
          <h2 className="text-2xl font-bold text-orange-700">
            {tone || "N/A"}
          </h2>
        </div>
      </div>

      {/* Transcripts */}
      <div className="rounded-xl p-6 border border-gray-200 shadow-sm bg-white">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Call Transcripts
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">
            Source Language Transcript {sourceLang ? `(${sourceLang})` : ""}
          </p>
          <div className="bg-gray-100 text-gray-800 p-3 rounded border border-gray-200">
            {transcript || "No transcript available"}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">
            Translated Transcript {targetLang ? `(${targetLang})` : ""}
          </p>
          <div className="bg-gray-100 text-gray-800 p-3 rounded border border-gray-200">
            {translatedTranscript || "No translation available"}
          </div>
        </div>
      </div>
    </div>
  );
}