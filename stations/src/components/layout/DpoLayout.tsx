"use client";

import { usePathname } from "next/navigation";
import { DpoSidebar } from "./DpoSidebar";
import { ShieldCheck, Bell, Search, User } from "lucide-react";

export function DpoLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <DpoSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-20 items-center justify-between px-8 border-bottom border-border bg-surface/30 backdrop-blur-md">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search stations, agents, reports..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-muted hover:text-white transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-400 rounded-full animate-pulse"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-border mx-2" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:border-amber-500/60 transition-colors">
                                <User className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">DPO Commander</span>
                                <span className="text-xs text-muted leading-tight">Department Head</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
