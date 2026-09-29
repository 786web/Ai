import React, { useState } from "react";
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Brain,
  Download,
  Terminal,
  Play,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import type { Message, UserProfile } from "../types/index.ts";
import { MarkdownRenderer } from "./MarkdownRenderer.tsx";

interface ChatContainerProps {
  messages: Message[];
  user: UserProfile;
  onRunCode?: (code: string, language: string) => void;
  onOpenImageModal?: (url: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  user,
  onRunCode,
  onOpenImageModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 animate-in fade-in duration-300 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {/* Assistant Avatar */}
            {!isUser && (
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <div className="w-full h-full bg-[#050814] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                </div>
              </div>
            )}

            {/* Message Body */}
            <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
              {/* User Message Card */}
              {isUser ? (
                <div className="space-y-2">
                  {/* Attachments preview if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200"
                        >
                          {att.mimeType.startsWith("image/") ? (
                            <img
                              src={att.previewUrl || `data:${att.mimeType};base64,${att.data}`}
                              alt={att.name}
                              className="w-10 h-10 rounded-lg object-cover border border-purple-500/20"
                            />
                          ) : (
                            <span className="font-mono text-[11px]">{att.name}</span>
                          )}
                          <span className="text-[11px] font-mono truncate max-w-[120px]">
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-purple-800/20 border border-purple-500/30 text-slate-100 text-sm leading-relaxed shadow-lg">
                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  </div>
                </div>
              ) : (
                /* Assistant Message Card */
                <div className="space-y-3">
                  {/* Agent Reasoning Box */}
                  {msg.reasoning && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 overflow-hidden">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full flex items-center justify-between p-2.5 px-3 text-xs font-mono text-purple-300 bg-purple-900/20 hover:bg-purple-900/30 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          Autonomous Agent Execution Trace
                        </span>
                        {expandedReasoning[msg.id] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {expandedReasoning[msg.id] && (
                        <div className="p-3 text-xs font-mono text-purple-200/90 whitespace-pre-wrap leading-relaxed border-t border-purple-500/20 bg-black/40">
                          {msg.reasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Response Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-100 text-sm leading-relaxed shadow-xl backdrop-blur-md">
                    {msg.error ? (
                      <div className="flex items-center gap-2 text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{msg.error}</span>
                      </div>
                    ) : (
                      <>
                        <MarkdownRenderer content={msg.content} onRunCode={onRunCode} />

                        {/* Streaming cursor */}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse align-middle" />
                        )}
                      </>
                    )}

                    {/* Generated Image Attachment inside message */}
                    {msg.generatedImage && (
                      <div className="mt-4 p-3 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
                          <span>Synthesized Neural Art</span>
                          <span className="text-[10px] text-slate-400">
                            Ratio: {msg.generatedImage.aspectRatio} • {msg.generatedImage.style}
                          </span>
                        </div>
                        <img
                          src={msg.generatedImage.url}
                          alt={msg.generatedImage.prompt}
                          className="max-h-80 w-auto rounded-lg object-contain mx-auto shadow-2xl border border-white/10"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="truncate max-w-sm">{msg.generatedImage.prompt}</span>
                          <a
                            href={msg.generatedImage.url}
                            download="trivexa-art.png"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Generated Code Attachment preview inside message */}
                    {msg.generatedCode && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-indigo-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs text-indigo-300 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5" />
                            {msg.generatedCode.title || "Synthesized Module"}
                          </span>
                          <span className="uppercase text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded">
                            {msg.generatedCode.language}
                          </span>
                        </div>
                        {onRunCode && (
                          <button
                            onClick={() =>
                              onRunCode(
                                msg.generatedCode!.code,
                                msg.generatedCode!.language
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Open in Live Code Playground</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Web Search Sources / Grounding citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block">
                          Verified Search Grounding Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 text-xs transition-colors group"
                            >
                              <span className="truncate max-w-[180px]">{source.title}</span>
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar */}
                  <div className="flex items-center gap-2 text-slate-400 pl-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 p-1 px-2 rounded-lg hover:bg-white/5 hover:text-slate-200 text-xs transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`flex items-center gap-1 p-1 px-2 rounded-lg hover:bg-white/5 text-xs transition-colors ${
                        speakingId === msg.id ? "text-purple-400" : "hover:text-slate-200"
                      }`}
                      title={speakingId === msg.id ? "Stop voice audio" : "Read aloud"}
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] text-slate-600 font-mono ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1px] shadow-sm">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-[11px] object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
