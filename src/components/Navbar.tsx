import React from "react";
import {
  Menu,
  Sparkles,
  Globe,
  Brain,
  Share2,
  Bookmark,
  Crown,
  Zap,
} from "lucide-react";
import type { UserProfile, ChatSession } from "../types/index.ts";

interface NavbarProps {
  onToggleSidebar: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  agentMode: boolean;
  onToggleAgentMode: () => void;
  onOpenMemory: () => void;
  onOpenExport: () => void;
  onOpenUserModal: () => void;
  user: UserProfile;
  activeSession: ChatSession | null;
  memoriesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  webSearch,
  onToggleWebSearch,
  agentMode,
  onToggleAgentMode,
  onOpenMemory,
  onOpenExport,
  onOpenUserModal,
  user,
  activeSession,
  memoriesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-white/10 bg-[#040814]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Logo Symbol */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#040814] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TRIVEXA <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                <span>🇵🇰</span>
                <span>PAKISTAN'S FIRST</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono tracking-wide">
              Quantum Intelligence v2.5 • Unified Engine
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Web Search Toggle */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            webSearch
              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200"
          }`}
          title={webSearch ? "Web Search Grounding ON" : "Turn ON Web Search"}
        >
          <Globe className={`w-3.5 h-3.5 ${webSearch ? "text-cyan-400 animate-spin" : ""}`} />
          <span className="hidden sm:inline">Web Search</span>
          {webSearch && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
        </button>

        {/* Agent Mode Toggle */}
        <button
          onClick={onToggleAgentMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            agentMode
              ? "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200"
          }`}
          title={agentMode ? "Autonomous Agent Reasoning Mode ON" : "Turn ON Agent Mode"}
        >
          <Brain className={`w-3.5 h-3.5 ${agentMode ? "text-purple-400 animate-pulse" : ""}`} />
          <span className="hidden sm:inline">Agent Mode</span>
          {agentMode && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
        </button>

        {/* AI Memory Button */}
        <button
          onClick={onOpenMemory}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-medium transition-colors"
          title="Trivexa Persistent Memory Store"
        >
          <Bookmark className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Memory</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
            {memoriesCount}
          </span>
        </button>

        {/* Export Chat Button */}
        {activeSession && activeSession.messages.length > 0 && (
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-medium transition-colors"
            title="Export conversation"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Export</span>
          </button>
        )}

        {/* User Profile Pill */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
              {user.name}
            </span>
            <span className="text-[9px] font-mono text-amber-400 flex items-center justify-end gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              {user.tier}
            </span>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-lg object-cover border border-purple-500/30"
          />
        </button>
      </div>
    </header>
  );
};
