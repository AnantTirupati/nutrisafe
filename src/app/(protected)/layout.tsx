import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { HealthChatbot } from "@/components/HealthChatbot";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Link from "next/link";
import { Scan } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:block">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Topbar />
          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
        <HealthChatbot />
        
        {/* Global Floating Scan Button */}
        <Link
          href="/scan"
          className="fixed bottom-[104px] right-6 z-40 flex items-center gap-2 rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-700/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary-700/40 focus:outline-none"
          title="Scan Food"
        >
          <Scan className="h-5 w-5" />
          <span className="hidden sm:inline">Scan Food</span>
          <span className="sm:hidden">Scan</span>
        </Link>
      </div>
    </ToastProvider>
  );
}
