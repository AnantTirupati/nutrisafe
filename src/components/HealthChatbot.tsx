"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Minimize2,
  Loader2,
  AlertCircle,
  ImagePlus,
  XCircle,
} from "lucide-react";

async function compressImage(file: File, maxPx = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  imagePreview?: string; // base64 thumbnail shown in chat
  isError?: boolean;
}

interface ApiMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

const GREETING =
  "👋 Hi! I'm your **NutriSafe Health AI** assistant.\n\nI can help you with:\n- 🥗 Personalized meal planning & nutrition\n- 📊 BMI & calorie calculations\n- 🩺 General symptom guidance\n- 🖼️ **Food image analysis** — upload a photo!\n- 💡 Health & lifestyle tips\n\nWhat can I help you with today?";

function formatMessage(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (!line.trim()) {
      elements.push(<br key={key++} />);
      continue;
    }

    // Bullet points
    const bulletMatch = line.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-1.5 my-0.5">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
          <span>{processBold(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 my-0.5">
          <span className="flex-shrink-0 text-xs font-bold text-emerald-600 mt-0.5">
            {numMatch[1]}.
          </span>
          <span>{processBold(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Section headers (emoji + **)
    const headerMatch = line.match(
      /^([🩺🥗📊❓🍽🖼⚠️👉💡✅🔒📦👤🧠🖼️]+)\s+\*\*(.*?)\*\*/
    );
    if (headerMatch) {
      elements.push(
        <p key={key++} className="font-semibold text-slate-800 mt-2 mb-1">
          {headerMatch[1]} <strong>{headerMatch[2]}</strong>
        </p>
      );
      continue;
    }

    elements.push(
      <p key={key++} className="my-0.5">
        {processBold(line)}
      </p>
    );
  }

  return <div className="text-sm leading-relaxed">{elements}</div>;
}

function processBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const MAX_IMAGE_SIZE_MB = 4;

export function HealthChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "bot", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null); // base64
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function buildHistory(): ApiMessage[] {
    return messages
      .filter((m) => m.id !== "greeting" && !m.isError)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPendingImage(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => { setPendingImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  async function sendMessage() {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text || "🖼️ *(image uploaded for analysis)*",
      imagePreview: imageToSend ?? undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = buildHistory();
      const body: Record<string, unknown> = { message: text, history };
      if (imageToSend) body.imageBase64 = imageToSend;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_bot",
          role: "bot",
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "bot",
          content:
            "⚠️ Sorry, something went wrong. Please try again in a moment.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          id="health-chatbot-toggle"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 focus:outline-none animate-pulse-slow"
          title="Open Health AI Chat"
        >
          <Bot className="h-5 w-5" />
          Health AI
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          id="health-chatbot-panel"
          className="fixed bottom-6 right-6 z-50 flex flex-col w-[390px] max-h-[600px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          style={{ animation: "slideUp 0.2s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-none">
                NutriSafe Health AI
              </p>
              <p className="text-xs text-emerald-100 mt-0.5">
                Powered by NutriSafe AI
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                BETA
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Close"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "bot" && (
                  <div className="mr-2 flex-shrink-0 mt-1">
                    {m.isError ? (
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm
                    ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm"
                        : m.isError
                        ? "bg-red-50 border border-red-100 text-red-700 rounded-bl-sm"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                    }`}
                >
                  {/* Image preview in user message */}
                  {m.imagePreview && (
                    <div className="mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imagePreview}
                        alt="Uploaded food"
                        className="w-full rounded-lg object-cover max-h-40 border border-white/20"
                      />
                    </div>
                  )}
                  {m.role === "bot"
                    ? formatMessage(m.content)
                    : <span>{m.content}</span>}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="mr-2 flex-shrink-0 mt-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts — only on first open */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              {[
                "Calculate my BMI",
                "Suggest a healthy breakfast",
                "I have a headache",
                "📸 Analyse my food photo",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    if (prompt === "📸 Analyse my food photo") {
                      fileInputRef.current?.click();
                    } else {
                      setInput(prompt);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }
                  }}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Image preview strip */}
          {pendingImage && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-t border-emerald-100 flex-shrink-0">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingImage}
                  alt="Preview"
                  className="h-14 w-14 rounded-lg object-cover border border-emerald-200"
                />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-white text-slate-500 hover:text-red-500 transition-colors shadow"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-emerald-700">
                <p className="font-medium">Image ready</p>
                <p className="text-emerald-600">
                  Add a message or send to analyse
                </p>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-2.5 flex-shrink-0">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              id="chatbot-file-input"
            />
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Upload food image"
              className={`flex-shrink-0 rounded-lg p-2 transition-colors ${
                pendingImage
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
              } disabled:opacity-40`}
            >
              <ImagePlus className="h-5 w-5" />
            </button>

            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder={
                pendingImage
                  ? "Add a question about this image…"
                  : "Ask me anything about health…"
              }
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !pendingImage) || loading}
              id="chatbot-send"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Disclaimer footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex-shrink-0">
            <p className="text-center text-[10px] text-slate-400">
              ⚠️ For informational purposes only · Images analysed by Gemini Vision
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
