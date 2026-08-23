"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChecklistStep {
  done: boolean;
  label: string;
  href: string;
  chatTrigger?: boolean;
}

export function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Get started with NutriSafe</h2>
        <span className="text-xs font-medium text-primary-700">
          {doneCount}/{steps.length} done
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) =>
          step.chatTrigger ? (
            <li key={step.label}>
              <button
                type="button"
                disabled={step.done}
                onClick={() => document.getElementById("health-chatbot-toggle")?.click()}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm",
                  step.done ? "text-slate-500" : "text-slate-800 hover:bg-white/70"
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <span className={step.done ? "line-through" : ""}>{step.label}</span>
              </button>
            </li>
          ) : (
            <li key={step.label}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
                  step.done ? "text-slate-500" : "text-slate-800 hover:bg-white/70"
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <span className={step.done ? "line-through" : ""}>{step.label}</span>
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
