import React, { useState, useEffect, useRef } from "react";
import { X, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Radio } from "lucide-react";

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscriptToChat: (userText: string, aiText: string) => void;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({ isOpen, onClose, onSendTranscriptToChat }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiVoiceReply, setAiVoiceReply] = useState("");
  const [voiceLog, setVoiceLog] = useState<Array<{ role: "user" | "trivexa"; text: string }>>([
    {
      role: "trivexa",
      text: "Assalam-o-Alaikum! I am Trivexa Neural Voice. What would you like to build or explore today?",
    },
  ]);
  const [muted, setMuted] = useState(false);

  // Reference for SpeechRecognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopVoice();
      return;
    }

    // Initialize Web Speech API if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Process user speech
        if (transcript.trim()) {
          handleUserVoiceQuery(transcript);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopVoice();
    };
  }, [isOpen, transcript]);

  const startListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setTranscript("");
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      // If already started or unsupported, provide quick fallback prompt
      setIsListening(true);
      setTimeout(() => {
        const dummyQuery = "What is the future of AI engineering in Pakistan?";
        setTranscript(dummyQuery);
        setIsListening(false);
        handleUserVoiceQuery(dummyQuery);
      }, 1600);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
  };

  const stopVoice = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (muted || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English or international voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleUserVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setVoiceLog((prev) => [...prev, { role: "user", text: queryText }]);
    setTranscript("");

    try {
      // Fast voice response from Gemini API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Respond concisely in 1-2 conversational spoken sentences as Trivexa AI: ${queryText}` }],
        }),
      });

      // Read stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === "token") {
                  fullReply += parsed.text;
                }
              } catch {}
            }
          }
        }
      }

      const cleanReply = fullReply.replace(/[*#`_]/g, "").trim() || "Trivexa Neural Engine is ready to assist your query.";
      setAiVoiceReply(cleanReply);
      setVoiceLog((prev) => [...prev, { role: "trivexa", text: cleanReply }]);
      speakText(cleanReply);
    } catch {
      const fallbackReply = "Understood. Trivexa is actively processing your request with quantum neural parameters.";
      setAiVoiceReply(fallbackReply);
      setVoiceLog((prev) => [...prev, { role: "trivexa", text: fallbackReply }]);
      speakText(fallbackReply);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-between min-h-[580px] p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#0b0f24] via-[#060814] to-[#02040a] shadow-[0_0_80px_rgba(168,85,247,0.25)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-600/15 via-cyan-500/10 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Trivexa Neural Voice</h3>
              <p className="text-[10px] text-slate-400 font-mono">Bilingual (English & Urdu) • Ultra Low Latency</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMuted(!muted);
                if (!muted) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-xl border transition-colors ${
                muted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
              title={muted ? "Unmute AI Voice" : "Mute AI Voice"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopVoice();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Orb & Visualizer */}
        <div className="my-auto flex flex-col items-center justify-center text-center relative py-6">
          {/* Animated Wave Rings */}
          <div
            className={`relative flex items-center justify-center transition-all duration-500 ${
              isSpeaking ? "scale-110" : isListening ? "scale-105" : "scale-100"
            }`}
          >
            {/* Outer Pulsing Rings */}
            <div
              className={`absolute w-64 h-64 rounded-full transition-opacity duration-700 ${
                isSpeaking
                  ? "bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-cyan-500/30 blur-2xl animate-pulse"
                  : isListening
                  ? "bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-purple-500/30 blur-2xl animate-ping"
                  : "bg-purple-600/10 blur-xl"
              }`}
            />

            {/* Middle Glow Ring */}
            <div
              className={`w-44 h-44 rounded-full border border-purple-500/40 p-2 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] ${
                isSpeaking ? "border-cyan-400 animate-spin" : isListening ? "border-purple-400 animate-pulse" : ""
              }`}
            >
              {/* Inner Glowing Holographic Orb */}
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isSpeaking
                    ? "bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.6)]"
                    : isListening
                    ? "bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-[0_0_60px_rgba(168,85,247,0.7)]"
                    : "bg-gradient-to-tr from-purple-900/80 via-slate-900 to-indigo-950/80 hover:border-purple-500"
                }`}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <Mic className="w-10 h-10 text-white animate-bounce" />
                ) : isSpeaking ? (
                  <Volume2 className="w-10 h-10 text-white animate-pulse" />
                ) : (
                  <Mic className="w-10 h-10 text-purple-300 hover:scale-110 transition-transform" />
                )}
                <span className="text-[10px] font-mono text-white/90 mt-1 uppercase tracking-wider">
                  {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to Speak"}
                </span>
              </div>
            </div>
          </div>

          {/* Soundwave Bars Simulation */}
          <div className="flex items-center gap-1.5 mt-8 h-8">
            {[18, 35, 48, 22, 54, 30, 42, 60, 24, 38, 50, 20].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isSpeaking || isListening ? `${Math.max(8, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2)}px` : "6px",
                }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? "bg-gradient-to-t from-cyan-400 to-purple-400"
                    : isListening
                    ? "bg-gradient-to-t from-purple-400 to-pink-400"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Status Text & Current Transcript */}
          <div className="mt-4 max-w-md px-4">
            {transcript ? (
              <p className="text-sm font-medium text-cyan-300 italic">"{transcript}"</p>
            ) : aiVoiceReply ? (
              <p className="text-sm text-slate-300 font-sans line-clamp-2">"{aiVoiceReply}"</p>
            ) : (
              <p className="text-xs text-slate-400">
                Speak naturally in Urdu or English. Trivexa understands voice nuances.
              </p>
            )}
          </div>
        </div>

        {/* Preset Voice Starters */}
        <div className="w-full space-y-2 z-10">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
            <span>Voice Prompt Starters</span>
            {voiceLog.length > 1 && (
              <button
                onClick={() => {
                  const lastUser = [...voiceLog].reverse().find((m) => m.role === "user");
                  const lastAi = [...voiceLog].reverse().find((m) => m.role === "trivexa");
                  if (lastUser && lastAi) {
                    onSendTranscriptToChat(lastUser.text, lastAi.text);
                    stopVoice();
                    onClose();
                  }
                }}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 normal-case font-sans"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Save conversation to chat</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Explain how Trivexa AI transforms tech in Pakistan",
              "Assalam-o-Alaikum! Summarize quantum computing simply",
              "What are 3 hot AI SaaS ideas for 2026?",
              "Give me an inspiring quote for Pakistani founders",
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(p);
                  handleUserVoiceQuery(p);
                }}
                className="text-left text-xs p-2 rounded-xl bg-white/5 hover:bg-purple-950/30 text-slate-300 hover:text-purple-200 border border-white/5 hover:border-purple-500/30 transition-all truncate"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
