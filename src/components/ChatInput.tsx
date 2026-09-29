import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Globe,
  Brain,
  X,
  FileText,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import type { Attachment } from "../types/index.ts";

interface ChatInputProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  agentMode: boolean;
  onToggleAgentMode: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  webSearch,
  onToggleWebSearch,
  agentMode,
  onToggleAgentMode,
}) => {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [inputText]);

  // Voice recording via Web Speech API
  const handleToggleMic = () => {
    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo prompt
      setInputText((prev) => (prev ? `${prev} ` : "") + "How can AI empower youth & freelancing in Pakistan?");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${speechResult}` : speechResult));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        const data = rawBase64.split(",")[1];
        const newAttachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          mimeType: file.type || "image/png",
          data,
          previewUrl: rawBase64,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    if (!inputText.trim() && attachments.length === 0) return;

    onSendMessage(inputText.trim(), attachments);
    setInputText("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <div className="relative rounded-2xl bg-[#090d1c]/90 border border-purple-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-2.5 sm:p-3 transition-all focus-within:border-purple-500/50 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
        {/* Attachments preview bar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-black/40 border border-white/5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200"
              >
                {att.mimeType.startsWith("image/") ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-8 h-8 rounded object-cover border border-purple-500/20"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-purple-400 p-0.5" />
                )}
                <span className="truncate max-w-[120px] font-mono text-[11px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Trivexa anything in English or Urdu... (Type or use mic)"
          rows={1}
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm px-2 py-1.5 focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-[180px]"
        />

        {/* Bottom Bar: Action buttons & Send */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
              title="Attach Image or Document / PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-2 rounded-xl transition-all ${
                isRecording
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
              title={isRecording ? "Stop listening" : "Speak to Trivexa AI"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Web Search toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                webSearch
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "bg-white/5 text-slate-400 border-white/5 hover:text-slate-200"
              }`}
              title={webSearch ? "Web Search ON" : "Turn ON Web Search"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Web Search</span>
            </button>

            {/* Agent Mode toggle */}
            <button
              type="button"
              onClick={onToggleAgentMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                agentMode
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-white/5 text-slate-400 border-white/5 hover:text-slate-200"
              }`}
              title={agentMode ? "Agent Mode ON" : "Turn ON Autonomous Agent Mode"}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Agent Mode</span>
            </button>
          </div>

          {/* Right Action: Send / Stop button */}
          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold shadow-md transition-all"
                title="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  inputText.trim() || attachments.length > 0
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/30 scale-105"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-500 font-mono mt-2">
        Trivexa AI Neural Engine v2.5 • Verify mission-critical facts. Made with pride for Pakistan.
      </p>
    </div>
  );
};
