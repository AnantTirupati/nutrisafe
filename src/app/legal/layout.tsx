import Link from "next/link";
import { Shield } from "lucide-react";

const LEGAL_NAV = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/fair-usage", label: "Fair Usage Policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-primary-700"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <Shield className="h-6 w-6" />
            NutriSafe
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Back to app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-slate-200 pb-6 text-sm">
          {LEGAL_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="font-medium text-slate-500 hover:text-primary-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <article className="legal-content">{children}</article>
      </div>
    </div>
  );
}
