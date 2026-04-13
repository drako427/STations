"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Shield, Bell, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const { logout, getUser, isAuthenticated } = useAuth();

    if (isLoginPage) {
        return <>{children}</>;
    }

    // Show loading state while checking authentication
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" suppressHydrationWarning></div>
            </div>
        );
    }

    const user = getUser();
    if (!user) {
        return null; // Will redirect to login via useAuth hook
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden" suppressHydrationWarning>
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-20 items-center justify-between px-8 border-bottom border-border bg-surface/30 backdrop-blur-md">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search suspects, cases, reports..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-muted hover:text-white transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-border mx-2" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">{user.username || 'Agent'}</span>
                                <span className="text-xs text-muted leading-tight">{user.role || 'Officer'}</span>
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
