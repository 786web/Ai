import React, { useState } from "react";
import { X, Sparkles, Download, Wand2, Loader2, ArrowRight, Check } from "lucide-react";

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (imageInfo: { url: string; prompt: string; style: string; aspectRatio: string }) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({ isOpen, onClose, onSendToChat }) => {
  const [prompt, setPrompt] = useState("A futuristic neon skyline of Lahore in the year 2099 with flying sky-taxis and holographic minarets");
  const [style, setStyle] = useState<"cyberpunk" | "photorealistic" | "3d-render" | "anime">("cyberpunk");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("1:1");
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    prompt: string;
    description: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleEnhancePrompt = () => {
    const enhancements = [
      "volumetric violet-cyan neon lighting, 8k resolution, ray-traced reflections, masterwork cinematic composition",
      "ultra-detailed textures, intricate architectural cyber-grid, moody atmospheric haze, award-winning concept art",
      "photorealistic HDR lighting, depth of field, Octane render aesthetic, high fidelity digital synthesis",
    ];
    const randomEnhance = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt((prev) => `${prev.trim()}, ${randomEnhance}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          style,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedResult({
          imageUrl: data.imageUrl,
          prompt: data.prompt,
          description: data.description || "",
        });
      }
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResult) return;
    const a = document.createElement("a");
    a.href = generatedResult.imageUrl;
    a.download = `trivexa-ai-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const presets = [
    "Cyberpunk bazaar in futuristic Karachi with glowing holographic neon signs",
    "High-tech quantum neural core floating inside an obsidian glass chamber",
    "Futuristic android engineer coding next-gen AI algorithms at night",
    "Breathtaking Karakoram mountain range with cosmic aurora and neon satellites",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trivexa Neural Image Studio
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gen 3.1
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transform natural language into 8K photorealistic artwork, cyberpunk concepts, and 3D renders
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Form */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Prompt Description</label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI Enhance</span>
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your imagination in detail..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Style Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Art Aesthetic</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cyberpunk", label: "Cyberpunk Neon", desc: "Vibrant neon, glowing accents" },
                  { id: "photorealistic", label: "Photorealistic 8K", desc: "Camera clarity & natural lighting" },
                  { id: "3d-render", label: "3D Octane Core", desc: "Glassmorphism & ray tracing" },
                  { id: "anime", label: "Anime Concept", desc: "Studio cel-shaded futuristic" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      style === s.id
                        ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Aspect Ratio</label>
              <div className="flex gap-2">
                {[
                  { ratio: "1:1", label: "1:1 Square" },
                  { ratio: "16:9", label: "16:9 Cinema" },
                  { ratio: "9:16", label: "9:16 Mobile" },
                  { ratio: "4:3", label: "4:3 Classic" },
                ].map((item) => (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setAspectRatio(item.ratio as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      aspectRatio === item.ratio
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Inspirations */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                Pakistan Future Inspirations:
              </label>
              <div className="space-y-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-white/5 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-200 border border-white/5 hover:border-cyan-500/20 transition-all truncate"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Visual Neural Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Neural Image</span>
                </>
              )}
            </button>
          </div>

          {/* Result View */}
          <div className="flex flex-col border border-white/10 rounded-2xl bg-slate-900/40 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                Studio Viewport
              </span>
              {generatedResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResult.prompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 text-xs text-slate-400 hover:text-white rounded-md bg-white/5"
                    title="Copy Prompt"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 text-xs text-cyan-300 hover:text-white rounded-md bg-cyan-600/20 border border-cyan-500/30 flex items-center gap-1"
                    title="Download High-Res PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[320px] rounded-xl bg-black/60 border border-white/5 p-2 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-cyan-400">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-xs font-mono text-slate-300">Rendering diffusion pixels...</p>
                </div>
              ) : generatedResult ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <img
                    src={generatedResult.imageUrl}
                    alt={generatedResult.prompt}
                    className="max-h-[340px] w-auto rounded-lg object-contain border border-white/10 shadow-2xl"
                  />
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="truncate max-w-[220px] font-mono text-[11px]">{generatedResult.prompt}</span>
                    <button
                      onClick={() => {
                        onSendToChat({
                          url: generatedResult.imageUrl,
                          prompt: generatedResult.prompt,
                          style,
                          aspectRatio,
                        });
                        onClose();
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <span>Insert in Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Sparkles className="w-10 h-10 text-cyan-500/30 mx-auto mb-2" />
                  <p className="text-xs">
                    Configure your prompt and click <strong className="text-slate-400">Generate Neural Image</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
