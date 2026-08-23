"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/history?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-500 focus:bg-white"
          />
        </div>
      </form>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          type="button"
          className="relative text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification dot placeholder */}
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 lg:pl-6">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold text-slate-900">
              {session?.user?.name || "Guest User"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
