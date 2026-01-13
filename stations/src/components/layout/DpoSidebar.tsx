"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Building2, Activity, Settings, LogOut, ShieldCheck,
    Globe, Users, FileBarChart, Siren, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const dpoNavigation = {
    main: [
        { name: "Dashboard", href: "/dpo-dashboard", icon: LayoutDashboard },
        { name: "Stations", href: "/dpo-dashboard/stations", icon: Building2 },
        { name: "Active Stations", href: "/dpo-dashboard/active-stations", icon: Activity },
    ],
    federal: [
        { name: "Global Alerts", href: "/dpo-dashboard/alerts", icon: Siren },
    ],
    system: [
        { name: "Settings", href: "#", icon: Settings },
    ]
};

export function DpoSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');

        // Redirection logic
        console.log("DPO session terminated. Redirecting to login...");
        router.push('/login');
    };

    const NavLink = ({ item }: { item: any }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                key={item.name}
                href={item.href}
                className={cn(
                    "nav-item",
                    isActive ? "active text-amber-400 bg-amber-400/10" : "text-muted hover:text-white"
                )}
            >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.name}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-full w-64 flex-col bg-surface/50 backdrop-blur-xl border-r border-border">
            <div className="flex h-20 items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">DPO</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Command Center</h3>
                    <nav className="space-y-1">
                        {dpoNavigation.main.map((item) => <NavLink key={item.name} item={item} />)}
                    </nav>
                </div>

                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Federal Database</h3>
                    <nav className="space-y-1">
                        {dpoNavigation.federal.map((item) => <NavLink key={item.name} item={item} />)}
                    </nav>
                </div>

                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">System</h3>
                    <nav className="space-y-1">
                        {dpoNavigation.system.map((item) => <NavLink key={item.name} item={item} />)}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-muted hover:text-rose-400 transition-colors rounded-md group"
                >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </div>
    );
}
