import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { HealthChatbot } from "@/components/HealthChatbot";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Topbar />
          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
        <HealthChatbot />
      </div>
    </ToastProvider>
  );
}
