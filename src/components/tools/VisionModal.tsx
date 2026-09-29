import React, { useState, useRef } from "react";
import { X, Upload, Sparkles, FileText, Image as ImageIcon, Loader2, ArrowRight } from "lucide-react";
import { MarkdownRenderer } from "../MarkdownRenderer.tsx";

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string, attachment: { mimeType: string; data: string; name: string }) => void;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, onSendToChat }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    mimeType: string;
    data: string;
    previewUrl: string;
  } | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(",")[1];
      const previewUrl = event.target?.result as string;

      setSelectedFile({
        name: file.name,
        mimeType: file.type || "image/png",
        data: base64Data,
        previewUrl,
      });
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (promptText?: string) => {
    if (!selectedFile) return;
    const promptToUse = promptText || customPrompt || "Analyze this image/document in detail with key insights, visual architecture, and actionable breakdown.";

    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          image: {
            mimeType: selectedFile.mimeType,
            data: selectedFile.data,
            name: selectedFile.name,
          },
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult("No analysis returned. Please verify the image file format.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error analyzing visual file";
      setAnalysisResult(`Analysis failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Deconstruct architecture & UI wireframe components",
    "Extract and summarize text, charts, and key statistics",
    "Find bugs or issues in code screenshot / diagram",
    "Translate and localize Urdu / multilingual document",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-purple-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trivexa Vision Engine
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Multimodal 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Analyze diagrams, photos, UI wireframes, PDFs, and data sheets with spatial intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Area */}
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-purple-950/10 hover:bg-purple-950/20 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-200 mb-1">
                Drop your image or document here, or <span className="text-purple-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports PNG, JPEG, WEBP, and PDF documents (up to 15MB)
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview file */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono truncate max-w-[200px]">{selectedFile.name}</span>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setAnalysisResult(null);
                    }}
                    className="text-purple-400 hover:underline"
                  >
                    Change file
                  </button>
                </div>
                <div className="relative rounded-xl border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center max-h-[300px]">
                  {selectedFile.mimeType.startsWith("image/") ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt="Upload preview"
                      className="max-h-[300px] w-auto object-contain"
                    />
                  ) : (
                    <div className="p-10 flex flex-col items-center gap-2 text-slate-300">
                      <FileText className="w-12 h-12 text-purple-400" />
                      <span className="text-xs font-mono">{selectedFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Prompt input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Analysis Prompt</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ask anything about this image..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleAnalyze()}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Analyze</span>
                    </button>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Quick Vision Prompts:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomPrompt(p);
                          handleAnalyze(p);
                        }}
                        className="text-left text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-purple-900/20 text-slate-300 hover:text-purple-200 border border-white/5 hover:border-purple-500/30 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Result or Chat transfer */}
              <div className="flex flex-col border border-white/10 rounded-xl bg-slate-900/40 p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Neural Insights
                  </span>
                  <button
                    onClick={() => {
                      onSendToChat(
                        customPrompt || "Analyze this image and break down its key features.",
                        selectedFile
                      );
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <span>Open in Full Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto text-sm text-slate-200 pr-1">
                  {loading ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
                      <p className="text-xs font-mono animate-pulse">Running Gemini Vision Neural Pass...</p>
                    </div>
                  ) : analysisResult ? (
                    <MarkdownRenderer content={analysisResult} />
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 px-6">
                      <p className="text-xs">
                        Select a quick prompt or click <strong className="text-slate-400">Analyze</strong> to inspect this file with Trivexa Vision.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
