"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, FileText, Trash2, Loader2, Calendar } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";

interface PlanSnippet {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyPlansPage() {
  const [plans, setPlans] = useState<PlanSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/diet-plans");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch plans");
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching plans");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      const res = await fetch(`/api/diet-plans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error deleting plan", "error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-md shadow-violet-200">
          <Bookmark className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Plans</h1>
          <p className="text-sm text-slate-500">
            View and edit your saved diet and workout plans
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700">No saved plans yet</h2>
          <p className="text-slate-500 mb-6">You haven&apos;t saved any AI diet plans.</p>
          <Link
            href="/diet-plan"
            className="btn-primary inline-flex bg-violet-600 hover:bg-violet-700"
          >
            Create a Plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan._id} className="card group flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="mb-4">
                <Link href={`/my-plans/${plan._id}`}>
                  <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 text-lg sm:truncate">
                    {plan.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(plan.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                <Link
                  href={`/my-plans/${plan._id}`}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  View / Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(plan._id)}
                  aria-label={`Delete ${plan.name}`}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete plan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this plan?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
