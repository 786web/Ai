import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  Eye,
  Sparkles,
  Terminal,
  Radio,
  Brain,
  Zap,
  Crown,
  ChevronRight,
  X,
} from "lucide-react";
import type { ChatSession, UserProfile } from "../types/index.ts";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenVision: () => void;
  onOpenImageGen: () => void;
  onOpenCode: () => void;
  onOpenVoice: () => void;
  onOpenMemory: () => void;
  onOpenUserModal: () => void;
  user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onOpenVision,
  onOpenImageGen,
  onOpenCode,
  onOpenVoice,
  onOpenMemory,
  onOpenUserModal,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const now = Date.now();
  const oneDay = 86400000;

  const todaySessions = filteredSessions.filter((s) => now - s.createdAt < oneDay);
  const yesterdaySessions = filteredSessions.filter(
    (s) => now - s.createdAt >= oneDay && now - s.createdAt < oneDay * 2
  );
  const olderSessions = filteredSessions.filter((s) => now - s.createdAt >= oneDay * 2);

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 flex flex-col bg-[#050814] border-r border-white/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Controls: New Chat + Close Button (mobile) */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Quantum Threads
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Start New Chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>
        </div>

        {/* 4 Tool Fast Launchers */}
        <div className="p-3 border-b border-white/5 bg-slate-950/40">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-2 block">
            Integrated Neural Tools
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onOpenVision();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-purple-950/30 text-slate-300 hover:text-purple-300 text-xs font-medium border border-white/5 hover:border-purple-500/20 transition-all text-left"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Vision</span>
            </button>
            <button
              onClick={() => {
                onOpenImageGen();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-white/5 hover:border-cyan-500/20 transition-all text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Image Gen</span>
            </button>
            <button
              onClick={() => {
                onOpenCode();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-indigo-950/30 text-slate-300 hover:text-indigo-300 text-xs font-medium border border-white/5 hover:border-indigo-500/20 transition-all text-left"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Code Matrix</span>
            </button>
            <button
              onClick={() => {
                onOpenVoice();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-pink-950/30 text-slate-300 hover:text-pink-300 text-xs font-medium border border-white/5 hover:border-pink-500/20 transition-all text-left"
            >
              <Radio className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Voice Mode</span>
            </button>
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No chat history yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Start your journey with Trivexa AI.</p>
            </div>
          ) : (
            <>
              {todaySessions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2">
                    Today
                  </span>
                  {todaySessions.map((session) => renderSessionItem(session))}
                </div>
              )}

              {yesterdaySessions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2">
                    Yesterday
                  </span>
                  {yesterdaySessions.map((session) => renderSessionItem(session))}
                </div>
              )}

              {olderSessions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2">
                    Previous 7 Days
                  </span>
                  {olderSessions.map((session) => renderSessionItem(session))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: User profile & Memory link */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 space-y-2">
          {/* Quick Memory Bar */}
          <button
            onClick={() => {
              onOpenMemory();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 text-xs text-purple-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Neural Memory Vault</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* User Account Trigger */}
          <button
            onClick={() => {
              onOpenUserModal();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover border border-purple-500/40"
              />
              <div className="text-left">
                <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <span>{user.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    PRO
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px] font-mono">
                  {user.email}
                </div>
              </div>
            </div>
            <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </aside>
    </>
  );

  function renderSessionItem(session: ChatSession) {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
          isActive
            ? "bg-purple-900/30 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
            }`}
          />
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 mr-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename(session.id, e);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-full bg-black/60 border border-purple-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                autoFocus
              />
              <button
                onClick={(e) => saveRename(session.id, e)}
                className="p-1 text-emerald-400 hover:bg-white/10 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="truncate flex-1 font-medium">{session.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => startRename(session, e)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
              title="Rename conversation"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
