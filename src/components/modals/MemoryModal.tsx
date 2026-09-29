import React, { useState } from "react";
import { X, Brain, Plus, Trash2, Sparkles, Check, Bookmark } from "lucide-react";
import type { MemoryItem } from "../../types/index.ts";

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onSaveMemories: (updated: MemoryItem[]) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onSaveMemories,
}) => {
  const [newText, setNewText] = useState("");
  const [category, setCategory] = useState<"preference" | "project" | "personal" | "custom">("preference");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newText.trim()) return;
    const item: MemoryItem = {
      id: `mem_${Date.now()}`,
      content: newText.trim(),
      category,
      createdAt: Date.now(),
    };
    const updated = [item, ...memories];
    onSaveMemories(updated);
    setNewText("");
    setFeedback("Memory saved into Trivexa Neural Store");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    onSaveMemories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl flex flex-col rounded-2xl border border-purple-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trivexa Neural Memory
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Pro Feature
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Persistent context and preferences recalled automatically across all chats
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Add new memory */}
          <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Teach Trivexa something about you:</span>
              <span className="text-[11px] text-purple-400 font-mono">Auto-injected into prompt</span>
            </label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. 'I run a software agency in Lahore building Next.js apps for global clients'..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-sans"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {(["preference", "project", "personal", "custom"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg capitalize border transition-all ${
                      category === cat
                        ? "bg-purple-600/30 text-purple-300 border-purple-500/50"
                        : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAdd}
                disabled={!newText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Memory</span>
              </button>
            </div>
            {feedback && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{feedback}</span>
              </p>
            )}
          </div>

          {/* List of current memories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider">Active Memory Nodes ({memories.length})</span>
            </div>

            {memories.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No memories stored yet. Add custom instructions above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                          {m.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{m.content}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Encrypted local vector context</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
