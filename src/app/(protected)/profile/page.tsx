"use client";

import { useEffect, useState } from "react";
import {
  MEDICAL_CONDITIONS,
  ALLERGIES,
  DIETARY_PREFERENCES,
} from "@/lib/constants";
import { Loader2, Save } from "lucide-react";

type Profile = {
  age?: number | null;
  gender?: string | null;
  medicalConditions: string[];
  allergies: string[];
  dietaryPreference: string;
  preferredLanguage: string;
  additionalNotes?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [options, setOptions] = useState<{
    medicalConditions: readonly string[];
    allergies: readonly string[];
    dietaryPreferences: readonly string[];
    languages: readonly string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setOptions(data.options ?? null);
      } else {
        setProfile({
          age: null,
          gender: null,
          medicalConditions: [],
          allergies: [],
          dietaryPreference: "Non-Vegetarian",
          preferredLanguage: "English",
          additionalNotes: null,
        });
        setOptions({
          medicalConditions: MEDICAL_CONDITIONS,
          allergies: ALLERGIES,
          dietaryPreferences: DIETARY_PREFERENCES,
          languages: ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Punjabi"],
        });
      }
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setProfile(data.profile);
      setMessage({ type: "ok", text: "Profile saved." });
    } else {
      setMessage({ type: "err", text: data.error ?? "Failed to save." });
    }
  }

  function toggle(arr: string[], item: string) {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  if (loading || !profile || !options) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Health profile</h1>
      <p className="mt-1 text-slate-600">
        Your conditions, allergies, and diet help us personalize risk analysis.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {message && (
          <div
            className={
              message.type === "ok"
                ? "rounded-lg bg-green-50 p-3 text-sm text-green-700"
                : "rounded-lg bg-red-50 p-3 text-sm text-red-700"
            }
          >
            {message.text}
          </div>
        )}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Basic info (optional)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Age</label>
              <input
                type="number"
                min={1}
                max={120}
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: e.target.value ? parseInt(e.target.value, 10) : null,
                  })
                }
                className="input mt-1"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                value={profile.gender ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    gender: e.target.value || null,
                  })
                }
                className="input mt-1"
              >
                <option value="">Optional</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Analysis Language</h2>
          <p className="text-sm text-slate-500">Choose your preferred language for the AI health analysis results.</p>
          <select
            value={profile.preferredLanguage}
            onChange={(e) =>
              setProfile({ ...profile, preferredLanguage: e.target.value })
            }
            className="input max-w-xs"
          >
            {options.languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Medical conditions</h2>
          <div className="flex flex-wrap gap-2">
            {options.medicalConditions.map((c) => (
              <label key={c} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.medicalConditions.includes(c)}
                  onChange={() =>
                    setProfile({
                      ...profile,
                      medicalConditions: toggle(profile.medicalConditions, c),
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Allergies</h2>
          <div className="flex flex-wrap gap-2">
            {options.allergies.map((a) => (
              <label key={a} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.allergies.includes(a)}
                  onChange={() =>
                    setProfile({
                      ...profile,
                      allergies: toggle(profile.allergies, a),
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">{a}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Dietary preference</h2>
          <select
            value={profile.dietaryPreference}
            onChange={(e) =>
              setProfile({ ...profile, dietaryPreference: e.target.value })
            }
            className="input max-w-xs"
          >
            {options.dietaryPreferences.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Additional notes</h2>
          <textarea
            value={profile.additionalNotes ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, additionalNotes: e.target.value || null })
            }
            className="input min-h-[80px]"
            placeholder="e.g. avoid caffeine, low sodium"
          />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save profile
        </button>
      </form>
    </div>
  );
}
