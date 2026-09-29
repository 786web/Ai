import type { ChatSession, UserProfile, MemoryItem } from "../types/index.ts";

const SESSIONS_KEY = "trivexa_chat_sessions_v1";
const ACTIVE_SESSION_KEY = "trivexa_active_session_id_v1";
const USER_KEY = "trivexa_user_profile_v1";
const MEMORY_KEY = "trivexa_ai_memory_v1";

export const DEFAULT_USER: UserProfile = {
  id: "usr_haadi_078",
  name: "Haadi",
  email: "haadich078@gmail.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  tier: "Founders Club",
  tokenUsage: 48200,
  tokenLimit: 250000,
  joinedDate: "September 2026",
};

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem_1",
    content: "User prefers Next.js, React 19, TypeScript, and modern Tailwind CSS with dark glassmorphic styling.",
    category: "preference",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "mem_2",
    content: "Building innovative AI solutions in Pakistan with focus on all-in-one vision, image, code, and voice.",
    category: "project",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "mem_3",
    content: "Fluent in both English and Urdu (Urdu tech localization preferred when queried in Urdu).",
    category: "personal",
    createdAt: Date.now() - 3600000 * 12,
  },
];

export function getSavedSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading sessions:", e);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Error saving sessions:", e);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch (e) {
    console.error("Error setting active session ID:", e);
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return DEFAULT_USER;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Error saving user:", e);
  }
}

export function getSavedMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(DEFAULT_MEMORIES));
      return DEFAULT_MEMORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEMORIES;
  }
}

export function saveMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error("Error saving memories:", e);
  }
}

export function exportChatToMarkdown(session: ChatSession): string {
  let md = `# ${session.title}\n\n`;
  md += `*Exported from Trivexa AI — Pakistan's First All-in-One Future AI*\n`;
  md += `*Date: ${new Date(session.createdAt).toLocaleString()}*\n\n---\n\n`;

  for (const msg of session.messages) {
    const roleName = msg.role === "user" ? "👤 User" : "✨ Trivexa AI";
    md += `### ${roleName} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n`;
    if (msg.reasoning) {
      md += `> **Agent Reasoning Trace:**\n> ${msg.reasoning.split("\n").join("\n> ")}\n\n`;
    }
    md += `${msg.content}\n\n`;
    if (msg.sources && msg.sources.length > 0) {
      md += `**Sources:**\n`;
      msg.sources.forEach((s) => {
        md += `- [${s.title}](${s.uri})\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  }
  return md;
}
