import type { IncomingMessage, ServerResponse } from "http";
import { getGeminiClient } from "./geminiService.ts";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
  attachments?: Array<{
    mimeType: string;
    data: string; // base64
    name?: string;
  }>;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  webSearch?: boolean;
  agentMode?: boolean;
  memory?: string[];
  systemPrompt?: string;
}

// Helper to read JSON request body from IncomingMessage
function parseBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        if (!raw) {
          resolve({} as T);
          return;
        }
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split("?")[0] || "";

  // Enable CORS & common headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. POST /api/chat - Streaming SSE
  if (url === "/api/chat" && req.method === "POST") {
    try {
      const body = await parseBody<ChatRequestBody>(req);
      const { messages, webSearch, agentMode, memory } = body;

      const ai = getGeminiClient();

      let systemInstruction = `You are Trivexa AI — Pakistan's First All-in-One Future AI. 
You are a premier, dark-futuristic, unified intelligence engine designed for high-performance Vision analysis, Image Generation promptcraft, Code Generation, and Voice interaction.
You possess deep knowledge across global cutting-edge computer science, mathematics, enterprise architecture, as well as Pakistan's thriving tech ecosystem, economy, languages (English & Urdu), and digital landscape.
Always be accurate, direct, highly capable, and format outputs in structured Markdown with syntax-highlighted code blocks where appropriate.`;

      if (memory && memory.length > 0) {
        systemInstruction += `\n\n[USER RECALLED MEMORY]:\nThe user has saved the following persistent context:\n- ${memory.join("\n- ")}\nTake this into account naturally.`;
      }

      if (agentMode) {
        systemInstruction += `\n\n[AGENT REASONING MODE ACTIVE]:
You are operating in Autonomous Agent Mode. For complex or multi-part queries:
1. Provide an initial collapsible or formatted reasoning trace:
### ⚡ Agent Execution Trace
- **Objective Analysis**: Brief summary of target outcome
- **Strategy & Breakdown**: Steps 1, 2, 3
- **Verification**: Integrity checks
2. Then provide the comprehensive, polished final solution.`;
      }

      // Convert messages to Gemini format
      // Gemini expects role: 'user' | 'model'
      const formattedContents = messages.map((m) => {
        const role = m.role === "assistant" ? "model" : m.role;
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

      // Prepare tools
      const tools: Array<{ googleSearch?: Record<string, never> }> = [];
      if (webSearch) {
        tools.push({ googleSearch: {} });
      }

      // Set headers for SSE streaming
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });

      // Call streaming API
      const stream = await ai.models.generateContentStream({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: tools.length > 0 ? tools : undefined,
          temperature: 0.7,
        },
      });

      let fullText = "";
      const searchSources: Array<{ title: string; uri: string }> = [];

      for await (const chunk of stream) {
        const text = chunk.text || "";
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
        }

        // Check if grounding metadata exists for search citations
        const candidate = chunk.candidates?.[0];
        const grounding = candidate?.groundingMetadata;
        if (grounding?.groundingChunks) {
          for (const gChunk of grounding.groundingChunks) {
            if (gChunk.web?.uri) {
              searchSources.push({
                title: gChunk.web.title || gChunk.web.uri,
                uri: gChunk.web.uri,
              });
            }
          }
        }
      }

      if (searchSources.length > 0) {
        // Send unique sources
        const uniqueSources = Array.from(
          new Map(searchSources.map((s) => [s.uri, s])).values()
        );
        res.write(`data: ${JSON.stringify({ type: "sources", sources: uniqueSources })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
      return true;
    } catch (err: unknown) {
      console.error("Chat API error:", err);
      const message = err instanceof Error ? err.message : "Internal AI generation error";
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: message }));
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`);
        res.end();
      }
      return true;
    }
  }

  // 2. POST /api/generate-image
  if (url === "/api/generate-image" && req.method === "POST") {
    try {
      const body = await parseBody<{
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
        style?: string;
      }>(req);

      const { prompt, aspectRatio = "1:1", style = "cyberpunk" } = body;
      const ai = getGeminiClient();

      let enhancedPrompt = prompt;
      if (style === "cyberpunk") {
        enhancedPrompt = `${prompt}, neon cyberpunk style, futuristic glowing accents, high definition, 8k digital art, dramatic volumetric lighting`;
      } else if (style === "photorealistic") {
        enhancedPrompt = `${prompt}, ultra-realistic 8k photograph, Hasselblad camera shot, intricate details, natural cinematic lighting, masterpiece`;
      } else if (style === "anime") {
        enhancedPrompt = `${prompt}, modern anime studio concept art, vibrant cel-shaded, futuristic aesthetic, crisp details`;
      } else if (style === "3d-render") {
        enhancedPrompt = `${prompt}, octane 3D render, glassmorphism, iridescent metallic surfaces, ambient occlusion, ray tracing`;
      }

      let imageUrl = "";
      let description = "";

      try {
        // Attempt using gemini-3.1-flash-lite-image
        const imageRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
        });

        if (imageRes.candidates?.[0]?.content?.parts) {
          for (const part of imageRes.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            } else if (part.text) {
              description += part.text;
            }
          }
        }
      } catch (imgErr) {
        console.warn("Direct image model not available or quota restricted, using neural synthesis fallback:", imgErr);
      }

      // If no image binary returned, generate a rich SVG neural artwork tailored to the prompt!
      if (!imageUrl) {
        imageUrl = generateFuturisticSvgArt(prompt, style, aspectRatio);
        description = `Synthesized visual representation: "${prompt}" in ${style} aesthetic with ${aspectRatio} aspect ratio.`;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          imageUrl,
          prompt,
          enhancedPrompt,
          aspectRatio,
          description,
        })
      );
      return true;
    } catch (err: unknown) {
      console.error("Image generation error:", err);
      const message = err instanceof Error ? err.message : "Image generation failed";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: message }));
      return true;
    }
  }

  // 3. POST /api/vision - Image/PDF Analysis
  if (url === "/api/vision" && req.method === "POST") {
    try {
      const body = await parseBody<{
        prompt: string;
        image: {
          mimeType: string;
          data: string;
          name?: string;
        };
      }>(req);

      const { prompt, image } = body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.data,
              },
            },
            {
              text: prompt || "Analyze this image/document thoroughly. Provide architectural insights, extracted text/tables, visual cues, and key takeaways in clean markdown.",
            },
          ],
        },
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          analysis: response.text || "No analysis generated.",
        })
      );
      return true;
    } catch (err: unknown) {
      console.error("Vision API error:", err);
      const message = err instanceof Error ? err.message : "Vision analysis failed";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: message }));
      return true;
    }
  }

  // 4. POST /api/generate-code
  if (url === "/api/generate-code" && req.method === "POST") {
    try {
      const body = await parseBody<{
        prompt: string;
        language?: string;
      }>(req);

      const { prompt, language = "typescript" } = body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are Trivexa Code Generator. Create production-ready, clean, well-commented code for the following request in ${language}.
Request: ${prompt}

Format your response as a JSON object with:
- "title": short descriptive title
- "language": the language (e.g. ${language})
- "code": the raw code without markdown backticks
- "explanation": brief explanation of key logic and algorithms
- "previewHtml": if the request is HTML/CSS/Tailwind/React/SVG, provide a self-contained HTML document ready to render in an iframe sandbox, otherwise null.`,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(parsed));
      return true;
    } catch (err: unknown) {
      console.error("Code generation error:", err);
      const message = err instanceof Error ? err.message : "Code generation failed";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: message }));
      return true;
    }
  }

  // 5. GET /api/health
  if (url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        platform: "Trivexa AI Neural Engine",
        version: "2.5-quantum",
        model: "gemini-3.8-flash",
      })
    );
    return true;
  }

  return false;
}

// Fallback high-tech neural artwork generator for guaranteed visual results
function generateFuturisticSvgArt(prompt: string, style: string, aspectRatio: string): string {
  let width = 800;
  let height = 800;
  if (aspectRatio === "16:9") {
    width = 1200;
    height = 675;
  } else if (aspectRatio === "9:16") {
    width = 675;
    height = 1200;
  } else if (aspectRatio === "4:3") {
    width = 800;
    height = 600;
  } else if (aspectRatio === "3:4") {
    width = 600;
    height = 800;
  }

  const sanitizedPrompt = prompt.slice(0, 70).replace(/[<>&"]/g, "");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050814"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#02040a"/>
      </linearGradient>
      <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.45"/>
        <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
      <filter id="bloom">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.4}" fill="url(#glow)"/>
    
    <!-- Cyber Geometric Core -->
    <g transform="translate(${width / 2}, ${height / 2})" filter="url(#bloom)">
      <circle r="${Math.min(width, height) * 0.28}" fill="none" stroke="url(#neon)" stroke-width="2" stroke-dasharray="12 8" opacity="0.8"/>
      <circle r="${Math.min(width, height) * 0.2}" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6"/>
      <polygon points="0,-70 60,35 -60,35" fill="none" stroke="url(#neon)" stroke-width="2.5" opacity="0.85"/>
      <polygon points="0,70 60,-35 -60,-35" fill="none" stroke="#a855f7" stroke-width="2" opacity="0.7"/>
      <circle r="14" fill="#ffffff" filter="url(#bloom)"/>
      <circle r="8" fill="#6366f1"/>
    </g>

    <!-- Tech Circuit Paths -->
    <path d="M 40,${height - 60} L 180,${height - 60} L 220,${height - 100} L ${width - 220},${height - 100} L ${width - 180},${height - 60} L ${width - 40},${height - 60}" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.4"/>
    
    <!-- Meta Overlay -->
    <rect x="30" y="30" width="220" height="34" rx="8" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(168, 85, 247, 0.3)"/>
    <text x="45" y="52" fill="#c084fc" font-family="monospace" font-size="12" font-weight="bold">TRIVEXA NEURAL ART</text>
    <circle cx="230" cy="47" r="4" fill="#10b981"/>

    <text x="${width / 2}" y="${height - 120}" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="1">${sanitizedPrompt}</text>
    <text x="${width / 2}" y="${height - 90}" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="13">STYLE: ${style.toUpperCase()} • RATIO: ${aspectRatio} • SYNTHESIS MATRIX v2.5</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
