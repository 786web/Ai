import React, { useState } from "react";
import { marked } from "marked";
import { Check, Copy, Code2, Play } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onRunCode?: (code: string, language: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onRunCode }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Extract code blocks to render them with interactive header (copy button & run button)
  const renderFormattedMarkdown = (text: string) => {
    // Split by triple backticks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].trim() || "plaintext";
        const code = lines.slice(1).join("\n");

        const handleCopy = () => {
          navigator.clipboard.writeText(code);
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        };

        const isExecutableWebCode = ["html", "svg", "javascript", "js", "jsx", "tsx", "css"].includes(
          language.toLowerCase()
        );

        return (
          <div
            key={index}
            className="my-4 rounded-xl border border-white/10 bg-[#090d16] overflow-hidden shadow-lg group"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                  {language}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isExecutableWebCode && onRunCode && (
                  <button
                    onClick={() => onRunCode(code, language)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-colors"
                    title="Open in Code Playground"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render standard markdown HTML
      const htmlContent = marked.parse(part) as string;

      return (
        <div
          key={index}
          className="prose prose-invert max-w-none prose-p:my-2 prose-headings:text-slate-100 prose-headings:font-bold prose-a:text-cyan-400 prose-a:underline hover:prose-a:text-cyan-300 prose-strong:text-purple-300 prose-ul:my-2 prose-li:my-0.5 prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-950/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-table:border prose-table:border-white/10 prose-th:bg-slate-800/80 prose-td:border-t prose-td:border-white/5"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    });
  };

  return <div className="space-y-1">{renderFormattedMarkdown(content)}</div>;
};
