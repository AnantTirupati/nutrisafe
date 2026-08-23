"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Dumbbell,
  Apple,
  ShoppingCart,
  Calendar,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  User,
  Save,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { PremiumGate } from "@/components/PremiumGate";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { useToast } from "@/components/ui/ToastProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type Goal = "weight loss" | "weight gain" | "maintenance" | "muscle gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very active";
type WorkoutLevel = "beginner" | "intermediate" | "advanced";

interface FormState {
  height: string;
  weight: string;
  goal: Goal;
  activityLevel: ActivityLevel;
  workoutLevel: WorkoutLevel;
  mealsPerDay: string;
  workoutTime: string;
  customRequest: string;
}

// ─── Section icons ────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "📊 Health Summary": {
    icon: <BarChart3 className="h-5 w-5" />,
    color: "from-blue-500 to-indigo-600",
  },
  "🍽️ Diet Plan (1 Full Day)": {
    icon: <Apple className="h-5 w-5" />,
    color: "from-emerald-500 to-teal-600",
  },
  "🛒 Grocery List": {
    icon: <ShoppingCart className="h-5 w-5" />,
    color: "from-orange-500 to-amber-500",
  },
  "💪 Workout Plan": {
    icon: <Dumbbell className="h-5 w-5" />,
    color: "from-purple-500 to-violet-600",
  },
  "📅 Weekly Plan (Mon–Sun)": {
    icon: <Calendar className="h-5 w-5" />,
    color: "from-sky-500 to-cyan-600",
  },
  "💡 Tips": {
    icon: <Lightbulb className="h-5 w-5" />,
    color: "from-yellow-400 to-orange-500",
  },
  "⚠️ Disclaimer": {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "from-red-400 to-rose-500",
  },
};

// ─── Rendered plan parser ─────────────────────────────────────────────────────

interface PlanSection {
  title: string;
  content: string;
}

function parseSections(raw: string): PlanSection[] {
  const lines = raw.split("\n");
  const sections: PlanSection[] = [];
  let current: PlanSection | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.*)/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { title: headingMatch[1].trim(), content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderContent(text: string): React.ReactNode {
  const lines = text.trim().split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === "---") {
      nodes.push(<div key={key++} className="h-1" />);
      continue;
    }

    // Sub-heading (###)
    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={key++} className="mt-4 mb-1 font-semibold text-slate-800 text-sm">
          {boldify(line.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }

    // Bold line (** whole line **)
    if (/^\*\*.*\*\*$/.test(line)) {
      nodes.push(
        <p key={key++} className="font-semibold text-slate-800 mt-2 text-sm">
          {boldify(line)}
        </p>
      );
      continue;
    }

    // Bullet point
    const bm = line.match(/^[-•*]\s+(.*)/);
    if (bm) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 py-0.5">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-50" />
          <span className="text-sm">{boldify(bm[1])}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const nm = line.match(/^(\d+)\.\s+(.*)/);
    if (nm) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 py-0.5">
          <span className="flex-shrink-0 w-5 text-xs font-bold opacity-60 mt-0.5">
            {nm[1]}.
          </span>
          <span className="text-sm">{boldify(nm[2])}</span>
        </div>
      );
      continue;
    }

    nodes.push(
      <p key={key++} className="text-sm py-0.5">
        {boldify(line)}
      </p>
    );
  }

  return <>{nodes}</>;
}

function boldify(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ─── Collapsible Section Card ─────────────────────────────────────────────────

function SectionCard({ section, defaultOpen = true }: { section: PlanSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SECTION_META[section.title];
  const gradient = meta?.color ?? "from-slate-500 to-slate-600";
  const icon = meta?.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        {icon && (
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            {icon}
          </div>
        )}
        <span className="flex-1 font-semibold text-slate-800 text-sm">
          {section.title}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div
          className={`border-t border-slate-100 px-5 py-4 text-slate-700`}
        >
          {renderContent(section.content)}
        </div>
      )}
    </div>
  );
}

// ─── Label / Select helpers ───────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {children}
    </label>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: "weight loss", label: "Weight Loss", emoji: "⬇️" },
  { value: "weight gain", label: "Weight Gain", emoji: "⬆️" },
  { value: "maintenance", label: "Maintenance", emoji: "⚖️" },
  { value: "muscle gain", label: "Muscle Gain", emoji: "💪" },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (desk job, no exercise)" },
  { value: "light", label: "Light (1-3 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very active", label: "Very Active (athlete/physical job)" },
];

const WORKOUT_LEVELS: { value: WorkoutLevel; label: string }[] = [
  { value: "beginner", label: "Beginner (just starting out)" },
  { value: "intermediate", label: "Intermediate (6+ months experience)" },
  { value: "advanced", label: "Advanced (2+ years training)" },
];

export default function DietPlanPage() {
  const [form, setForm] = useState<FormState>({
    height: "",
    weight: "",
    goal: "maintenance",
    activityLevel: "light",
    workoutLevel: "beginner",
    mealsPerDay: "3",
    workoutTime: "30",
    customRequest: "",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (plan) setSections(parseSections(plan));
  }, [plan]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.height || !form.weight) {
      setError("Please enter your height and weight.");
      return;
    }
    setLoading(true);
    setError(null);
    setPlan(null);
    setSections([]);

    try {
      const res = await fetch("/api/diet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(form.height),
          weight: Number(form.weight),
          goal: form.goal,
          activityLevel: form.activityLevel,
          workoutLevel: form.workoutLevel,
          mealsPerDay: Number(form.mealsPerDay),
          workoutTime: Number(form.workoutTime),
          customRequest: form.customRequest || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan");
      setPlan(data.plan);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePlan(name: string) {
    if (!plan) return;
    setSavingPlan(true);
    try {
      const res = await fetch("/api/diet-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save plan");
      setSavedPlanId(data.plan._id);
      setShowSaveDialog(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saving plan", "error");
    } finally {
      setSavingPlan(false);
    }
  }

  function handleDownload() {
    if (!plan) return;
    const blob = new Blob([plan], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutrisafe-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-md shadow-violet-200">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Diet &amp; Exercise Plan
            </h1>
            <p className="text-sm text-slate-500">
              AI-generated plan personalised to your health profile
            </p>
          </div>
        </div>
        <Link
          href="/my-plans"
          className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <Bookmark className="h-4 w-4" />
          My Saved Plans
        </Link>
      </div>

      <PremiumGate>
        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-violet-500" />
            <h2 className="font-semibold text-slate-900">Your Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Height (cm) *</Label>
              <input
                type="number"
                min={100}
                max={250}
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                className="input"
                placeholder="e.g. 165"
                required
                id="input-height"
              />
            </div>
            <div>
              <Label>Weight (kg) *</Label>
              <input
                type="number"
                min={20}
                max={300}
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                className="input"
                placeholder="e.g. 65"
                required
                id="input-weight"
              />
            </div>
          </div>
        </div>

        {/* Goal Selector */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Your Goal</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => set("goal", g.value)}
                className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-medium transition-all ${
                  form.goal === g.value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                id={`goal-${g.value.replace(" ", "-")}`}
              >
                <div className="text-xl mb-1">{g.emoji}</div>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity & Workout */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Activity &amp; Workout</h2>
          <div>
            <Label>Activity Level</Label>
            <select
              value={form.activityLevel}
              onChange={(e) => set("activityLevel", e.target.value as ActivityLevel)}
              className="input"
              id="select-activity"
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Workout Experience</Label>
            <select
              value={form.workoutLevel}
              onChange={(e) => set("workoutLevel", e.target.value as WorkoutLevel)}
              className="input"
              id="select-workout-level"
            >
              {WORKOUT_LEVELS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Meals per day</Label>
              <select
                value={form.mealsPerDay}
                onChange={(e) => set("mealsPerDay", e.target.value)}
                className="input"
                id="select-meals"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} meals
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Workout time available</Label>
              <select
                value={form.workoutTime}
                onChange={(e) => set("workoutTime", e.target.value)}
                className="input"
                id="select-workout-time"
              >
                {[15, 20, 30, 45, 60, 75, 90, 120].map((t) => (
                  <option key={t} value={t}>
                    {t} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Optional custom request */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-2">
            Anything specific? <span className="text-slate-400 font-normal">(optional)</span>
          </h2>
          <textarea
            value={form.customRequest}
            onChange={(e) => set("customRequest", e.target.value)}
            rows={2}
            className="input min-h-[70px] resize-none"
            placeholder="e.g. I love dal and roti, avoid heavy gym equipment, need early morning workout plan…"
            id="input-custom-request"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          id="generate-plan-btn"
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating your personalised plan…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {generated ? "Regenerate Plan" : "Generate My Plan"}
            </>
          )}
        </button>
      </form>

      {/* Plan Output */}
      {loading && (
        <div className="mt-12 flex flex-col items-center gap-4 py-12 text-slate-500">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 opacity-20 animate-ping absolute inset-0" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700">Creating your plan…</p>
            <p className="text-sm text-slate-400 mt-1">
              NutriSafe AI is building a personalised diet &amp; workout plan for you
            </p>
          </div>
        </div>
      )}

      {sections.length > 0 && !loading && (
        <div className="mt-10 space-y-4">
          {/* Plan header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Your Personalised Plan</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(true)}
                disabled={savingPlan || !!savedPlanId}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                  savedPlanId
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {savingPlan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedPlanId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {savedPlanId ? "Saved!" : "Save Plan"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                id="download-plan-btn"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button
                type="button"
                onClick={() => { setPlan(null); setSections([]); setGenerated(false); setSavedPlanId(null); }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                id="clear-plan-btn"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Section cards */}
          {sections.map((s, i) => (
            <SectionCard
              key={i}
              section={s}
              defaultOpen={i < 3}
            />
          ))}
        </div>
      )}
      </PremiumGate>

      <PromptDialog
        open={showSaveDialog}
        title="Save this plan"
        label="Plan name"
        defaultValue="My Diet Plan"
        confirmLabel={savingPlan ? "Saving…" : "Save"}
        onConfirm={handleSavePlan}
        onCancel={() => setShowSaveDialog(false)}
      />
    </div>
  );
}
