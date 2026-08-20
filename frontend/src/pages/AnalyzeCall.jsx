import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCall } from "../context/useCall";
import { analyzeCallApi } from "../services/api";

export default function AnalyzeCall() {
  const navigate = useNavigate();
  const { generateCallId, currentCallId, setCurrentCallId } = useCall();
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [step, setStep] = useState(0);
  const [sourceLang, setSourceLang] = useState("Auto Detect");
  const [targetLang, setTargetLang] = useState("English");

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        navigate("/dashboard/results");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const steps = [
    "Speech-to-Text Conversion",
    "Language Translation",
    "Multimodal AI Analysis",
    "Completed",
  ];

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
      setStep(0);
    }
  };

const startAnalysis = async () => {
    if (!audioFile) {
      alert("Please upload an audio file");
      return;
    }

    try {
      setStep(1);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("source_lang", sourceLang);
      formData.append("target_lang", targetLang);

      setStep(2);
      console.log("Sending - sourceLang:", sourceLang, "targetLang:", targetLang);
      const response = await analyzeCallApi(formData);
      const realId = response.call_id || response.analysis_id;
      setCurrentCallId(realId);
      setStep(3);
      setStep(4);


      navigate("/dashboard/results", {
        state: {
          callId: realId, 
          transcript: response.transcript,
          translatedTranscript: response.translated_transcript,
          finalSarcasmScore: response.final_sarcasm_score,
          textSarcasmScore: response.text_sarcasm_score,
          audioToneScore: response.audio_tone_score,
          tone: response.tone,
          sentiment: response.sentiment,
          sttConfidence: response.stt_confidence,
          translationConfidence: response.translation_confidence,
          targetLang: targetLang,
          sourceLang: sourceLang,
        },
      });
    } catch (err) {
      console.error("Analysis error:", err);
      let msg = "Analysis failed. Please check backend is running.";
      if (err.response) {
        msg = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        msg = "Cannot connect to backend. Make sure backend is running on http://127.0.0.1:5000";
      }
      alert(msg);
      setStep(0);
    }
  };

  const cancelUpload = () => {
    setAudioFile(null);
    setAudioURL(null);
    setStep(0);
  };

  return (
    <div className="max-w-5xl mx-auto rounded-lg p-8 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Analyze Customer Call
      </h2>

      {/* Audio Upload */}
      <div className="border-2 border-dashed border-violet-400 dark:border-violet-500 rounded-lg p-8 text-center mb-6 bg-violet-100 dark:bg-slate-800">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Upload customer support call audio
        </p>

        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="mx-auto text-gray-900 dark:text-white"
        />

        {audioURL && (
          <div className="mt-4">
            <audio controls src={audioURL} className="mx-auto" />
          </div>
        )}
      </div>

{/* Language Selection */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div>
    <label className="block text-sm font-medium text-white/90 mb-1">
      Source Language
    </label>
    <select
      value={sourceLang}
      onChange={(e) => setSourceLang(e.target.value)}
      className="w-full border border-gray-300 bg-gray-100 text-gray-800 text-gray-900 rounded-md p-2 backdrop-blur-sm"
    >
      <option>Auto Detect</option>
      <option>English</option>
      <option>Tamil</option>
      <option>Kannada</option>
      <option>Hindi</option>
      <option>Telugu</option>
      <option>Malayalam</option>
      <option>Marathi</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-1">
      Target Language
    </label>
    <select
      value={targetLang}
      onChange={(e) => setTargetLang(e.target.value)}
      className="w-full border border-gray-300 bg-gray-100 text-gray-800 text-gray-900 rounded-md p-2 backdrop-blur-sm"
    >
      <option>English</option>
      <option>Tamil</option>
      <option>Kannada</option>
      <option>Hindi</option>
      <option>Telugu</option>
      <option>Malayalam</option>
      <option>Marathi</option>
    </select>
  </div>
</div>

      {/* Analyze Button */}
      <div className="flex gap-4 justify-end mb-8">
        <button
          onClick={cancelUpload}
          disabled={!audioFile}
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            audioFile
              ? "bg-red-500/30 text-red-700 hover:bg-red-500/40 border border-red-400/50"
              : "bg-gray-400/10 text-gray-700 cursor-not-allowed border border-gray-400/20"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={startAnalysis}
          disabled={!audioFile}
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            audioFile
              ? "bg-violet-400 text-purple-900 hover:bg-violet-500"
              : "bg-gray-400/30 text-gray-700 cursor-not-allowed"
          }`}
        >
          Analyze Call
        </button>
      </div>

      {/* Call ID Display */}
      {currentCallId && (
        <div className="mb-6 p-4 bg-violet-500/10 border border-violet-400/30 rounded-lg">
          <p className="text-purple-700 text-sm mb-1 font-semibold">Call ID Generated</p>
          <div className="flex items-center justify-between">
            <p className="text-violet-700 font-mono font-bold text-lg">{currentCallId || "Will be assigned after analysis"}</p>
            <button
              onClick={() => navigator.clipboard.writeText(currentCallId)}
              className="px-3 py-1 bg-violet-500/20 border border-violet-400 text-violet-700 rounded text-sm hover:bg-violet-500/30 transition"
            >
              Copy ID
            </button>
          </div>
        </div>
      )}

      {/* Processing Steps */}
      {step > 0 && (
        <div className="space-y-3">
          {steps.map((label, index) => (
            <div
              key={index}
              className={`p-3 rounded-md flex items-center justify-between border ${
                step > index + 1
                  ? "bg-green-500/20 text-green-700 border-green-"
                  : step === index + 1
                  ? "bg-violet-500/30 text-violet-900 border-violet-400 animate-pulse"
                  : "bg-gray-100 text-black border-gray-200"
              }`}
            >
              <span>{label}</span>
              {step > index + 1 && <span>✔</span>}
            </div>
          ))}
        </div>
      )}

      {/* Status Display */}
      {step > 0 && (
        <div className="mt-6 p-4 rounded-lg border">
          {step === 4 ? (
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Analysis Status</p>
              <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                Completed
              </span>
            </div>
          ) : step >= 1 && step < 4 ? (
            <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">Analysis Status</p>
              <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700">
                Pending
              </span>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">Analysis Status</p>
              <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
                Failed
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}














