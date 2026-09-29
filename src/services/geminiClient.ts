import type { Attachment } from "../types/index.ts";

export interface StreamChatOptions {
  messages: Array<{
    role: "user" | "model" | "assistant";
    content: string;
    attachments?: Array<{ mimeType: string; data: string; name?: string }>;
  }>;
  webSearch?: boolean;
  agentMode?: boolean;
  memory?: string[];
  onToken: (text: string) => void;
  onSources?: (sources: Array<{ title: string; uri: string }>) => void;
  onStatusNotice?: (notice: string) => void;
  signal?: AbortSignal;
}

/**
 * Direct Gemini API call following exact v1beta endpoint and schema:
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...
 * Body format: { contents: [{ parts: [{ text: userInput }] }] }
 * Includes automatic 404 recovery showing "Model not found, switched to gemini-1.5-flash"
 */
export async function streamGeminiChat(options: StreamChatOptions): Promise<void> {
  const { messages, onToken, onSources, onStatusNotice, signal } = options;

  // 1. Try local server-side proxy route (/api/chat) first
  let serverRouteWorked = false;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        messages,
        webSearch: options.webSearch,
        agentMode: options.agentMode,
        memory: options.memory,
      }),
    });

    if (res.ok && res.body) {
      serverRouteWorked = true;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token" && data.text) {
                onToken(data.text);
              } else if (data.type === "sources" && data.sources && onSources) {
                onSources(data.sources);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (pErr) {
              // Ignore boundary JSON split
            }
          }
        }
      }
      return;
    }
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      throw err;
    }
    // If not abort, fall through to direct Gemini API call below
    console.warn("Server route /api/chat not reachable (e.g. Netlify static deploy), using direct Gemini API client:", err);
  }

  // 2. Direct Gemini API call (v1beta) with automatic 404 model switching
  // Key retrieved from import.meta.env.VITE_GEMINI_API_KEY
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== "undefined" && process.env ? process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY : "");

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "Gemini API Key missing. Please provide VITE_GEMINI_API_KEY in your Netlify or environment settings."
    );
  }

  // Models to attempt: starting with gemini-1.5-flash, with automatic fallback
  let candidateModels = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-flash-latest"];

  // Format messages into Google Gemini v1beta schema:
  // { contents: [{ role: "user", parts: [{ text: userInput }] }] }
  const formattedContents = messages.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (m.attachments && m.attachments.length > 0) {
      for (const att of m.attachments) {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          },
        });
      }
    }

    if (m.content) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: "" });
    }

    return { role, parts };
  });

  // Prepare system instruction if memory or agent mode
  let systemInstructionText = "You are Trivexa AI — Pakistan's First All-in-One Future AI. Answer clearly and comprehensively in Markdown.";
  if (options.memory && options.memory.length > 0) {
    systemInstructionText += `\n[User Memory Context]:\n- ${options.memory.join("\n- ")}`;
  }
  if (options.agentMode) {
    systemInstructionText += "\nAgent Mode: Begin your response with '### ⚡ Agent Execution Trace' detailing your step-by-step reasoning plan, then provide the final solution.";
  }

  let success = false;
  let lastError = "";

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const requestBody = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 404) {
        // Model not found - display user required notification and try fallback
        const notice = "Model not found, switched to gemini-1.5-flash";
        if (onStatusNotice) onStatusNotice(notice);
        lastError = `Model ${model} returned 404`;
        continue; // Try next fallback model
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${response.status}`);
      }

      // Stream the response chunks
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const candidates = data.candidates || [];
                for (const c of candidates) {
                  const parts = c.content?.parts || [];
                  for (const p of parts) {
                    if (p.text) {
                      onToken(p.text);
                    }
                  }
                }
              } catch (e) {
                // Ignore SSE framing gaps
              }
            }
          }
        }
      }

      success = true;
      break;
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        throw err;
      }
      lastError = (err as Error)?.message || String(err);
    }
  }

  if (!success) {
    // If streaming failed, try one non-streaming generateContent call as final resilience
    const nonStreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
      const nonStreamRes = await fetch(nonStreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({ contents: formattedContents }),
      });

      if (nonStreamRes.status === 404) {
        if (onStatusNotice) onStatusNotice("Model not found, switched to gemini-1.5-flash");
      }

      if (nonStreamRes.ok) {
        const json = await nonStreamRes.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          onToken(text);
          return;
        }
      }
    } catch {
      // Fall through to throw lastError
    }

    throw new Error(lastError || "Neural processing halted: HTTP error 404");
  }
}
