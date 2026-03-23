"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Loader2, Save, Edit3, Trash2, CheckCircle2,
  Dumbbell, Apple, ShoppingCart, Calendar, BarChart3, Lightbulb, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Section icons ────────────────────────────────────────────────────────────
const SECTION_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "📊 Health Summary": { icon: <BarChart3 className="h-5 w-5" />, color: "from-blue-500 to-indigo-600" },
  "🍽️ Diet Plan (1 Full Day)": { icon: <Apple className="h-5 w-5" />, color: "from-emerald-500 to-teal-600" },
  "🛒 Grocery List": { icon: <ShoppingCart className="h-5 w-5" />, color: "from-orange-500 to-amber-500" },
  "💪 Workout Plan": { icon: <Dumbbell className="h-5 w-5" />, color: "from-purple-500 to-violet-600" },
  "📅 Weekly Plan (Mon–Sun)": { icon: <Calendar className="h-5 w-5" />, color: "from-sky-500 to-cyan-600" },
  "💡 Tips": { icon: <Lightbulb className="h-5 w-5" />, color: "from-yellow-400 to-orange-500" },
  "⚠️ Disclaimer": { icon: <AlertTriangle className="h-5 w-5" />, color: "from-red-400 to-rose-500" },
};

// ─── Parser ───────────────────────────────────────────────────────────────────
interface PlanSection { title: string; content: string; }
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
    if (!line || line === "---") { nodes.push(<div key={key++} className="h-1" />); continue; }
    if (line.startsWith("### ")) { nodes.push(<h4 key={key++} className="mt-4 mb-1 font-semibold text-slate-800 text-sm">{boldify(line.replace(/^###\s+/, ""))}</h4>); continue; }
    if (/^\*\*.*\*\*$/.test(line)) { nodes.push(<p key={key++} className="font-semibold text-slate-800 mt-2 text-sm">{boldify(line)}</p>); continue; }
    const bm = line.match(/^[-•*]\s+(.*)/);
    if (bm) { nodes.push(<div key={key++} className="flex items-start gap-2 py-0.5"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-50" /><span className="text-sm">{boldify(bm[1])}</span></div>); continue; }
    const nm = line.match(/^(\d+)\.\s+(.*)/);
    if (nm) { nodes.push(<div key={key++} className="flex items-start gap-2 py-0.5"><span className="flex-shrink-0 w-5 text-xs font-bold opacity-60 mt-0.5">{nm[1]}.</span><span className="text-sm">{boldify(nm[2])}</span></div>); continue; }
    nodes.push(<p key={key++} className="text-sm py-0.5">{boldify(line)}</p>);
  }
  return <>{nodes}</>;
}

function boldify(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return <>{parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{p}</strong> : <span key={i}>{p}</span>)}</>;
}

function SectionCard({ section, defaultOpen = true }: { section: PlanSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SECTION_META[section.title];
  const gradient = meta?.color ?? "from-slate-500 to-slate-600";
  const icon = meta?.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        {icon && <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>{icon}</div>}
        <span className="flex-1 font-semibold text-slate-800 text-sm">{section.title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className={`border-t border-slate-100 px-5 py-4 text-slate-700`}>{renderContent(section.content)}</div>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPlanDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [planName, setPlanName] = useState("");
  const [planContent, setPlanContent] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContent, setEditContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchPlan();
  }, [id]);

  async function fetchPlan() {
    try {
      const res = await fetch(`/api/diet-plans/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch plan");
      
      setPlanName(data.plan.name);
      setPlanContent(data.plan.content);
      setCreatedAt(new Date(data.plan.createdAt).toLocaleDateString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/diet-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      setPlanName(editName);
      setIsEditingName(false);
      showSuccess("Name updated");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveContent() {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/diet-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error("Failed to update content");
      setPlanContent(editContent);
      setIsEditingContent(false);
      showSuccess("Plan updated");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this plan forever?")) return;
    try {
      const res = await fetch(`/api/diet-plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/my-plans");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting");
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>;

  const sections = parseSections(planContent);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link href="/my-plans" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to My Plans
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="input py-1 text-lg font-bold w-full sm:w-64 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                autoFocus
              />
              <button disabled={saving} onClick={handleSaveName} className="p-1.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"><CheckCircle2 className="w-5 h-5" /></button>
              <button disabled={saving} onClick={() => setIsEditingName(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{planName}</h1>
              <button onClick={() => { setEditName(planName); setIsEditingName(true); }} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Name"><Edit3 className="w-4 h-4" /></button>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">Created on {createdAt}</p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditingContent && (
            <button
              onClick={() => { setEditContent(planContent); setIsEditingContent(true); }}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Plan
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Content Editor / Viewer */}
      {isEditingContent ? (
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-semibold text-slate-800">Edit Markdown Content</h3>
            <div className="flex items-center gap-2">
              <button disabled={saving} onClick={() => setIsEditingContent(false)} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={saving} onClick={handleSaveContent} className="btn-primary flex items-center gap-1.5 py-1.5 px-4 text-sm"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-[60vh] p-4 text-sm font-mono text-slate-700 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none resize-y"
            placeholder="Plan content in markdown..."
          />
        </div>
      ) : (
        <div>
          {sections.map((s, i) => (
            <SectionCard key={i} section={s} defaultOpen={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
