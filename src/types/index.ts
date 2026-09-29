export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  size?: number;
  previewUrl?: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  reasoning?: string;
  sources?: SearchSource[];
  generatedImage?: {
    url: string;
    prompt: string;
    style: string;
    aspectRatio: string;
  };
  generatedCode?: {
    title: string;
    language: string;
    code: string;
    explanation?: string;
    previewHtml?: string | null;
  };
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  agentMode?: boolean;
  webSearch?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: "Free" | "Pro" | "Founders Club";
  tokenUsage: number;
  tokenLimit: number;
  joinedDate: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: "preference" | "project" | "personal" | "custom";
  createdAt: number;
}
