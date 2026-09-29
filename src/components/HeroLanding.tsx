import React from "react";
import {
  Eye,
  Sparkles,
  Terminal,
  Radio,
  ArrowRight,
  Cpu,
  Layers,
  Zap,
  Globe2,
} from "lucide-react";

interface HeroLandingProps {
  onOpenVision: () => void;
  onOpenImageGen: () => void;
  onOpenCode: () => void;
  onOpenVoice: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onOpenVision,
  onOpenImageGen,
  onOpenCode,
  onOpenVoice,
  onSelectPrompt,
}) => {
  const toolCards = [
    {
      id: "vision",
      title: "Vision Analysis",
      subtitle: "Analyze Image / PDF / Code UI",
      desc: "Deconstruct architectural schematics, OCR documents, audit UI designs, and extract tabular data with multimodal vision.",
      icon: Eye,
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      borderGlow: "hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      action: onOpenVision,
      tag: "Spatial AI 3.8",
    },
    {
      id: "image",
      title: "Image Generation",
      subtitle: "8K Photoreal & Cyberpunk Art",
      desc: "Synthesize high-fidelity concept art, Pakistani futurism landscapes, 3D Octane renders, and cinematic visual assets.",
      icon: Sparkles,
      gradient: "from-cyan-500/20 via-blue-600/10 to-transparent",
      borderGlow: "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      action: onOpenImageGen,
      tag: "Gen 3.1 Diffusion",
    },
    {
      id: "code",
      title: "Code Generation",
      subtitle: "Full-Stack & Live Sandboxes",
      desc: "Generate production TypeScript, Next.js, Python, Rust, and test interactive components inside live browser sandbox runtimes.",
      icon: Terminal,
      gradient: "from-indigo-500/20 via-indigo-600/10 to-transparent",
      borderGlow: "hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      action: onOpenCode,
      tag: "Multi-Language Exec",
    },
    {
      id: "voice",
      title: "Voice Mode",
      subtitle: "Pakistan's Neural Voice Assistant",
      desc: "Real-time bilingual voice interaction in English and Urdu with holographic waveform visualizer and natural conversational cadence.",
      icon: Radio,
      gradient: "from-pink-500/20 via-rose-600/10 to-transparent",
      borderGlow: "hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]",
      badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
      action: onOpenVoice,
      tag: "Urdu & English Voice",
    },
  ];

  const suggestedPrompts = [
    {
      title: "Pakistan Tech SaaS Ecosystem",
      prompt: "How can a Pakistani founder build an AI SaaS startup in 2026 with international Stripe/Wise alternatives and local payment gateways?",
      icon: "🇵🇰",
    },
    {
      title: "Full-Stack Next.js Architecture",
      prompt: "Write a high-performance Next.js 15 Server Action with optimistic UI updates, rate limiting, and TypeScript types.",
      icon: "⚡",
    },
    {
      title: "Cyberpunk Lahore 2099 Concept",
      prompt: "Describe the visual and architectural atmosphere of a cyberpunk cyber-bazaar in Old Lahore in 2099 with holographic calligraphy.",
      icon: "🌌",
    },
    {
      title: "Deep STEM & Quantum Computing",
      prompt: "Explain topological qubits and quantum error correction in clear terms with mathematical intuition.",
      icon: "🔬",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-14 space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        {/* National Flagship Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-medium text-slate-200 tracking-wide">
            🇵🇰 Pakistan's First All-in-One Future AI
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-mono text-purple-400">Quantum Neural Engine v2.5</span>
        </div>

        {/* Landing Headline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Build the Future with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Trivexa AI
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300/90 font-medium leading-relaxed">
            The unified AI for <span className="text-purple-300 font-semibold">Vision</span>,{" "}
            <span className="text-cyan-300 font-semibold">Image Generation</span>,{" "}
            <span className="text-indigo-300 font-semibold">Code Generation</span>, and{" "}
            <span className="text-pink-300 font-semibold">Voice</span>.
          </p>
        </div>

        {/* Sub-features pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Gemini 3.8 Ultra
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            Live Search Grounding
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Sub-second Streaming
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Persistent Vector Memory
          </span>
        </div>
      </div>

      {/* 4 Tool Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-sm font-bold font-mono tracking-wider text-slate-300 uppercase">
              Core Quantum Capabilities
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Select any tool to launch workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={tool.action}
                className={`group relative p-5 rounded-2xl bg-gradient-to-b ${tool.gradient} bg-[#070b18]/70 border border-white/10 backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] ${tool.borderGlow}`}
              >
                {/* Top: Icon & Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                      {tool.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">{tool.subtitle}</p>
                  </div>
                </div>

                {/* Body Text */}
                <p className="text-xs text-slate-300/80 leading-relaxed my-3 line-clamp-3">
                  {tool.desc}
                </p>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pt-3 border-t border-white/5 group-hover:text-white">
                  <span>Launch Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block px-1">
          Explore Trivexa Neural Intelligence:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestedPrompts.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-purple-500/30 transition-all flex items-start gap-3 group"
            >
              <span className="text-base">{item.icon}</span>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate font-sans">
                  {item.prompt}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
