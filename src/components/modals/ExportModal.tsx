import React, { useState } from "react";
import { X, Download, Copy, Check, FileCode, FileText, Share2, Printer } from "lucide-react";
import confetti from "canvas-confetti";
import type { ChatSession } from "../../types/index.ts";
import { exportChatToMarkdown } from "../../utils/storage.ts";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, session }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  const markdownContent = exportChatToMarkdown(session);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#a855f7", "#6366f1", "#06b6d4"],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (type: "md" | "txt" | "json") => {
    let content = "";
    let mimeType = "text/plain";
    let extension = type;

    if (type === "md") {
      content = markdownContent;
      mimeType = "text/markdown";
    } else if (type === "txt") {
      content = session.messages
        .map((m) => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleTimeString()}]:\n${m.content}\n\n`)
        .join("----------------------------------------\n\n");
    } else if (type === "json") {
      content = JSON.stringify(session, null, 2);
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trivexa-chat-${session.id.slice(0, 8)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#06b6d4", "#10b981"],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg flex flex-col rounded-2xl border border-purple-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Conversation</h2>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">
                "{session.title}" • {session.messages.length} messages
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

        {/* Options */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownload("md")}
              className="p-4 rounded-xl bg-white/5 hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 text-left transition-all group"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-white">Markdown (.md)</div>
              <div className="text-xs text-slate-400 mt-1">Formatted for GitHub, Obsidian, & Notion</div>
            </button>

            <button
              onClick={() => handleDownload("json")}
              className="p-4 rounded-xl bg-white/5 hover:bg-cyan-950/30 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-white">JSON Archive</div>
              <div className="text-xs text-slate-400 mt-1">Complete raw telemetry & messages</div>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload("txt")}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plain Text (.txt)</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Full Chat Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Entire Conversation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
