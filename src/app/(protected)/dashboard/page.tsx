import Link from "next/link";
import { Scan, History, Heart, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-600">
        Scan a product, check your history, or update your profile.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/scan"
          className="card flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Scan className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Scan food</h2>
            <p className="text-sm text-slate-600">Barcode, label photo, or type</p>
          </div>
        </Link>
        <Link
          href="/history"
          className="card flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Scan history</h2>
            <p className="text-sm text-slate-600">Past scans with risk levels</p>
          </div>
        </Link>
        <Link
          href="/safe-foods"
          className="card flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Safe for me</h2>
            <p className="text-sm text-slate-600">Low-risk foods you&apos;ve scanned</p>
          </div>
        </Link>
        <Link
          href="/profile"
          className="card flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-600">Conditions, allergies, diet</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
