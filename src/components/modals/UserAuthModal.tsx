import React, { useState } from "react";
import { X, User, Crown, Zap, ShieldCheck, Check, Settings2, Globe, LogOut } from "lucide-react";
import type { UserProfile } from "../../types/index.ts";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const percentUsed = Math.round((user.tokenUsage / user.tokenLimit) * 100);

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name,
      email,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col rounded-2xl border border-purple-500/30 bg-[#0a0f1d] shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trivexa Pro Account</h2>
              <p className="text-xs text-slate-400">Pakistan's Next-Gen AI Membership</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-500/30">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-black border-2 border-[#0a0f1d]">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" />
                  {user.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{email}</p>
              <p className="text-[11px] text-purple-300">Member since {user.joinedDate}</p>
            </div>
          </div>

          {/* Token Usage Meter */}
          <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Quantum Inference Quota
              </span>
              <span className="text-purple-300 font-mono font-semibold">
                {user.tokenUsage.toLocaleString()} / {user.tokenLimit.toLocaleString()} tokens
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div
                style={{ width: `${percentUsed}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Monthly high-speed allocation</span>
              <span>{100 - percentUsed}% remaining</span>
            </div>
          </div>

          {/* Edit info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Profile Preferences Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
