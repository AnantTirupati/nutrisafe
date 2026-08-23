"use client";

import { Bot } from "lucide-react";

export function AskAIButton() {
  return (
    <button
      type="button"
      onClick={() => document.getElementById("health-chatbot-toggle")?.click()}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 -mx-2 text-sm hover:bg-slate-50"
    >
      <Bot className="h-4 w-4 text-slate-400" />
      <span className="flex-1 text-left text-slate-700">Ask Health AI</span>
    </button>
  );
}
