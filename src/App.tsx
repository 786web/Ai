import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { HeroLanding } from "./components/HeroLanding.tsx";
import { ChatContainer } from "./components/ChatContainer.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { VisionModal } from "./components/tools/VisionModal.tsx";
import { ImageGenModal } from "./components/tools/ImageGenModal.tsx";
import { CodePlaygroundModal } from "./components/tools/CodePlaygroundModal.tsx";
import { VoiceModeModal } from "./components/tools/VoiceModeModal.tsx";
import { MemoryModal } from "./components/modals/MemoryModal.tsx";
import { ExportModal } from "./components/modals/ExportModal.tsx";
import { UserAuthModal } from "./components/modals/UserAuthModal.tsx";
import { streamGeminiChat } from "./services/geminiClient.ts";
import { Info, X } from "lucide-react";

import type {
  ChatSession,
  Message,
  Attachment,
  UserProfile,
  MemoryItem,
} from "./types/index.ts";
import {
  getSavedSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId,
  getUserProfile,
  saveUserProfile,
  getSavedMemories,
  saveMemories,
} from "./utils/storage.ts";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [user, setUser] = useState<UserProfile>(getUserProfile());
  const [memories, setMemories] = useState<MemoryItem[]>(getSavedMemories());
  const [webSearch, setWebSearch] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [codePlaygroundInitial, setCodePlaygroundInitial] = useState<{
    code?: string;
    language?: string;
  }>({});
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize sessions from localStorage
  useEffect(() => {
    const saved = getSavedSessions();
    if (saved && saved.length > 0) {
      setSessions(saved);
      const activeId = getActiveSessionId();
      if (activeId && saved.some((s) => s.id === activeId)) {
        setActiveSessionIdState(activeId);
      } else {
        setActiveSessionIdState(saved[0].id);
      }
    }
  }, []);

  // Save sessions to localStorage on change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isStreaming]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const createNewChat = (initialTitle?: string): string => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: initialTitle || "New Conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      webSearch,
      agentMode,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionIdState(newId);
    setActiveSessionId(newId);
    return newId;
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    saveSessions(remaining);
    if (activeSessionId === id) {
      const nextId = remaining.length > 0 ? remaining[0].id : null;
      setActiveSessionIdState(nextId);
      if (nextId) setActiveSessionId(nextId);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const handleSendMessage = async (content: string, attachments: Attachment[] = []) => {
    let currentSessionId = activeSessionId;
    let targetSession = activeSession;

    // Create session if none exists
    if (!currentSessionId || !targetSession) {
      const generatedTitle =
        content.slice(0, 32).trim() || (attachments.length > 0 ? attachments[0].name : "Vision Analysis");
      currentSessionId = createNewChat(generatedTitle);
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: "user",
      content,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = `msg_${Date.now()}_a`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Update session with user message and placeholder assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          // If title was default, give it a meaningful name from prompt
          const title =
            s.messages.length === 0
              ? content.slice(0, 36) || attachments[0]?.name || "New Chat"
              : s.title;

          return {
            ...s,
            title,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage, initialAssistantMessage],
          };
        }
        return s;
      })
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      // Gather context messages for Gemini API
      const prevMessages = (targetSession?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map((a) => ({
          mimeType: a.mimeType,
          data: a.data,
          name: a.name,
        })),
      }));

      const contextMessages = [
        ...prevMessages,
        {
          role: "user" as const,
          content: userMessage.content,
          attachments: userMessage.attachments?.map((a) => ({
            mimeType: a.mimeType,
            data: a.data,
            name: a.name,
          })),
        },
      ];

      let accumulatedText = "";
      let sources: Array<{ title: string; uri: string }> = [];

      await streamGeminiChat({
        messages: contextMessages,
        webSearch,
        agentMode,
        memory: memories.map((m) => m.content),
        signal: abortControllerRef.current.signal,
        onToken: (token) => {
          accumulatedText += token;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: accumulatedText }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        },
        onSources: (newSources) => {
          sources = newSources;
        },
        onStatusNotice: (notice) => {
          setStatusNotice(notice);
          setTimeout(() => setStatusNotice(null), 6000);
        },
      });

      // Check if text contains agent execution trace
      let reasoningTrace: string | undefined = undefined;
      let finalCleanText = accumulatedText;

      if (accumulatedText.includes("### ⚡ Agent Execution Trace") || accumulatedText.includes("### 🧠 Autonomous Agent Reasoning")) {
        const splitTag = accumulatedText.includes("### ⚡ Agent Execution Trace")
          ? "### ⚡ Agent Execution Trace"
          : "### 🧠 Autonomous Agent Reasoning";

        const parts = accumulatedText.split(splitTag);
        if (parts.length > 1) {
          const subParts = parts[1].split("\n\n---\n\n");
          if (subParts.length > 1) {
            reasoningTrace = subParts[0].trim();
            finalCleanText = subParts.slice(1).join("\n\n").trim();
          } else {
            reasoningTrace = parts[1].slice(0, 300).trim();
          }
        }
      }

      // Finalize assistant message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: finalCleanText,
                      reasoning: reasoningTrace,
                      sources: sources.length > 0 ? sources : undefined,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );

      // Increment token usage in user stats
      setUser((prev) => {
        const updated = {
          ...prev,
          tokenUsage: Math.min(prev.tokenLimit, prev.tokenUsage + Math.round(accumulatedText.length / 3)),
        };
        saveUserProfile(updated);
        return updated;
      });
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        // User canceled stream
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return s;
          })
        );
      } else {
        const message = err instanceof Error ? err.message : "Error generating AI response";
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: "",
                        error: `Neural processing halted: ${message}`,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Insertion handlers from tool modals into active conversation
  const handleInsertGeneratedImage = (imageInfo: {
    url: string;
    prompt: string;
    style: string;
    aspectRatio: string;
  }) => {
    let targetId = activeSessionId;
    if (!targetId) {
      targetId = createNewChat(`Art: ${imageInfo.prompt.slice(0, 24)}`);
    }

    const assistantMsg: Message = {
      id: `msg_${Date.now()}_img`,
      role: "assistant",
      content: `Here is the synthesized **${imageInfo.style.toUpperCase()}** neural artwork for: *"${imageInfo.prompt}"*`,
      timestamp: Date.now(),
      generatedImage: imageInfo,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetId
          ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
          : s
      )
    );
  };

  const handleInsertGeneratedCode = (codeData: {
    title: string;
    language: string;
    code: string;
    explanation?: string;
  }) => {
    let targetId = activeSessionId;
    if (!targetId) {
      targetId = createNewChat(`Code: ${codeData.title.slice(0, 24)}`);
    }

    const assistantMsg: Message = {
      id: `msg_${Date.now()}_code`,
      role: "assistant",
      content: `Generated ${codeData.language.toUpperCase()} module:\n\n\`\`\`${codeData.language}\n${codeData.code}\n\`\`\`\n\n${codeData.explanation || ""}`,
      timestamp: Date.now(),
      generatedCode: codeData,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetId
          ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
          : s
      )
    );
  };

  const handleOpenCodeInPlayground = (code: string, language: string) => {
    setCodePlaygroundInitial({ code, language });
    setIsCodeOpen(true);
  };

  const handleVoiceTranscriptToChat = (userText: string, aiText: string) => {
    let targetId = activeSessionId;
    if (!targetId) {
      targetId = createNewChat(`Voice: ${userText.slice(0, 24)}`);
    }

    const uMsg: Message = {
      id: `msg_${Date.now()}_vu`,
      role: "user",
      content: userText,
      timestamp: Date.now() - 1000,
    };

    const aMsg: Message = {
      id: `msg_${Date.now()}_va`,
      role: "assistant",
      content: aiText,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetId
          ? { ...s, messages: [...s.messages, uMsg, aMsg], updatedAt: Date.now() }
          : s
      )
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 cyber-grid">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionIdState(id);
          setActiveSessionId(id);
        }}
        onNewChat={() => createNewChat()}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenImageGen={() => setIsImageGenOpen(true)}
        onOpenCode={() => {
          setCodePlaygroundInitial({});
          setIsCodeOpen(true);
        }}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        user={user}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          webSearch={webSearch}
          onToggleWebSearch={() => setWebSearch(!webSearch)}
          agentMode={agentMode}
          onToggleAgentMode={() => setAgentMode(!agentMode)}
          onOpenMemory={() => setIsMemoryOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          user={user}
          activeSession={activeSession}
          memoriesCount={memories.length}
        />

        {/* Status Notification Banner (e.g. Model switched / 404 recovery) */}
        {statusNotice && (
          <div className="mx-4 mt-3 flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="p-1 hover:bg-white/10 rounded text-amber-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Central View Area: Hero or Chat */}
        <main className="flex-1 overflow-y-auto relative flex flex-col justify-between">
          {!activeSession || activeSession.messages.length === 0 ? (
            <HeroLanding
              onOpenVision={() => setIsVisionOpen(true)}
              onOpenImageGen={() => setIsImageGenOpen(true)}
              onOpenCode={() => {
                setCodePlaygroundInitial({});
                setIsCodeOpen(true);
              }}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onSelectPrompt={(promptText) => handleSendMessage(promptText)}
            />
          ) : (
            <div className="flex-1">
              <ChatContainer
                messages={activeSession.messages}
                user={user}
                onRunCode={handleOpenCodeInPlayground}
              />
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* Sticky Bottom Input Bar */}
          <div className="sticky bottom-0 z-20 pt-2 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent">
            <ChatInput
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              webSearch={webSearch}
              onToggleWebSearch={() => setWebSearch(!webSearch)}
              agentMode={agentMode}
              onToggleAgentMode={() => setAgentMode(!agentMode)}
            />
          </div>
        </main>
      </div>

      {/* 4 Tool Modals */}
      <VisionModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        onSendToChat={(prompt, attachment) => {
          handleSendMessage(prompt, [
            {
              id: `att_${Date.now()}`,
              name: attachment.name,
              mimeType: attachment.mimeType,
              data: attachment.data,
            },
          ]);
        }}
      />

      <ImageGenModal
        isOpen={isImageGenOpen}
        onClose={() => setIsImageGenOpen(false)}
        onSendToChat={handleInsertGeneratedImage}
      />

      <CodePlaygroundModal
        isOpen={isCodeOpen}
        onClose={() => setIsCodeOpen(false)}
        onSendToChat={handleInsertGeneratedCode}
        initialCode={codePlaygroundInitial.code}
        initialLanguage={codePlaygroundInitial.language}
      />

      <VoiceModeModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendTranscriptToChat={handleVoiceTranscriptToChat}
      />

      {/* Pro Features Modals */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onSaveMemories={(updated) => {
          setMemories(updated);
          saveMemories(updated);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={activeSession}
      />

      <UserAuthModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          saveUserProfile(updated);
        }}
      />
    </div>
  );
}
