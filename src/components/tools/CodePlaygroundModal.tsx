import React, { useState } from "react";
import { X, Code2, Play, Copy, Check, Download, Loader2, Sparkles, Terminal, ArrowRight } from "lucide-react";

interface CodePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (codeData: { title: string; language: string; code: string; explanation?: string }) => void;
  initialCode?: string;
  initialLanguage?: string;
}

export const CodePlaygroundModal: React.FC<CodePlaygroundModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  initialCode,
  initialLanguage = "typescript",
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [prompt, setPrompt] = useState("Build an animated futuristic cyber-card with glassmorphism, glowing borders, and live metrics in HTML and Tailwind CSS");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);

  const [generatedCode, setGeneratedCode] = useState<string>(
    initialCode ||
      `// Trivexa Neural Engine v2.5
interface QuantumNode {
  id: string;
  telemetryRate: number;
  status: 'active' | 'syncing' | 'idle';
  computeLatencyMs: number;
}

export class NeuralMeshCluster {
  private nodes: Map<string, QuantumNode> = new Map();

  registerNode(node: QuantumNode): void {
    this.nodes.set(node.id, node);
    console.log(\`[Trivexa Mesh] Node \${node.id} operational at \${node.computeLatencyMs}ms\`);
  }

  getOptimalNode(): QuantumNode | undefined {
    return Array.from(this.nodes.values())
      .filter(n => n.status === 'active')
      .sort((a, b) => a.computeLatencyMs - b.computeLatencyMs)[0];
  }
}`
  );

  const [previewHtml, setPreviewHtml] = useState<string | null>(
    `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#030712] text-slate-100 p-8 flex items-center justify-center min-h-screen">
  <div class="relative p-6 rounded-2xl bg-gradient-to-b from-purple-900/30 to-black/60 border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-xl max-w-sm w-full">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">QUANTUM LINK</span>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
    </div>
    <h3 class="text-lg font-bold text-white mb-1">Trivexa Neural Core</h3>
    <p class="text-xs text-slate-400 mb-4">Autonomous intelligence running on Pakistan's premier future node.</p>
    <div class="space-y-2 font-mono text-xs">
      <div class="flex justify-between p-2 rounded bg-white/5">
        <span class="text-slate-400">Inference Latency</span>
        <span class="text-cyan-400 font-bold">1.2ms</span>
      </div>
      <div class="flex justify-between p-2 rounded bg-white/5">
        <span class="text-slate-400">Tokens/Sec</span>
        <span class="text-purple-400 font-bold">184 t/s</span>
      </div>
    </div>
  </div>
</body>
</html>`
  );

  const [explanation, setExplanation] = useState<string>(
    "Production-ready typed cluster implementation utilizing optimal node resolution algorithms."
  );

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      });

      const data = await res.json();
      if (data.code) {
        setGeneratedCode(data.code);
        setExplanation(data.explanation || "");
        if (data.previewHtml) {
          setPreviewHtml(data.previewHtml);
          setActiveTab("preview");
        } else if (language === "html" || language === "react") {
          setPreviewHtml(`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#050814] text-white p-6">${data.code}</body></html>`);
        }
      }
    } catch (err) {
      console.error("Code generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      typescript: "ts",
      python: "py",
      html: "html",
      react: "tsx",
      rust: "rs",
      sql: "sql",
    };
    const ext = extensions[language] || "txt";
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trivexa-module-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl border border-indigo-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trivexa Neural Code Matrix
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.5 Full-Stack
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                High-performance code synthesis, architecture generation, and live sandbox runner
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

        {/* Toolbar & Controls */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-900/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target Language:</span>
            {["typescript", "python", "html", "react", "sql", "rust"].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono uppercase transition-all ${
                  language === lang
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Live Sandbox</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 px-3 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition-colors border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 px-3 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Prompt Bar */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Describe what you want to code (e.g. Next.js server actions, LRU cache, Tailwind UI)..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Code</span>
          </button>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === "code" ? (
            <div className="flex-1 overflow-auto bg-[#070b16] p-4 font-mono text-sm leading-relaxed text-slate-200">
              <pre className="overflow-x-auto whitespace-pre">
                <code>{generatedCode}</code>
              </pre>
            </div>
          ) : (
            <div className="flex-1 bg-white overflow-hidden relative">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Trivexa Code Sandbox"
                  sandbox="allow-scripts"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="w-full h-full bg-[#080d1a] flex flex-col items-center justify-center text-slate-400 p-6">
                  <Play className="w-10 h-10 text-indigo-400 mb-2" />
                  <p className="text-sm">Sandbox preview available for HTML, CSS, React, and Tailwind code.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer bar with explanation & Chat transfer */}
          <div className="p-3 px-6 border-t border-white/10 bg-slate-900/70 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate max-w-lg font-sans">
              <strong className="text-indigo-400">Insight:</strong> {explanation}
            </span>
            <button
              onClick={() => {
                onSendToChat({
                  title: prompt.slice(0, 40),
                  language,
                  code: generatedCode,
                  explanation,
                });
                onClose();
              }}
              className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium bg-indigo-600/20 hover:bg-indigo-600/40 px-3 py-1 rounded-lg border border-indigo-500/30 transition-all"
            >
              <span>Send to Chat Conversation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
