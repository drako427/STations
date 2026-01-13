"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users, Settings, LogOut, ShieldAlert,
    Briefcase, Ghost, Package, Globe, UserCheck, ShieldQuestion
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = {
    local: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "My Suspect", href: "/suspects", icon: Users },
        { name: "Cases", href: "/cases", icon: Briefcase },
        { name: "Unsolved cases", href: "/cases/unsolved", icon: Ghost },
        { name: "Missing property", href: "/property/missing", icon: Package },
    ],
    national: [
        { name: "National Suspects", href: "/national/suspects", icon: UserCheck },
        { name: "National Unsolved", href: "/national/unsolved", icon: ShieldQuestion },
        { name: "National Property", href: "/national/property", icon: Globe },
    ],
    system: [
        { name: "Settings", href: "#", icon: Settings },
    ]
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [stationName, setStationName] = useState<string | null>(null);

    useEffect(() => {
        // Get station info from localStorage or fetch it
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            if (userData.station_name) {
                setStationName(userData.station_name);
            }
        }
    }, []);

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirection logic
        console.log("Agent session terminated. Redirecting to login...");
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
                    isActive ? "active text-primary bg-primary/10" : "text-muted hover:text-white"
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
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        {stationName || 'STATIONS'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Local Jurisdiction</h3>
                    <nav className="space-y-1">
                        {navigation.local.map((item) => <NavLink key={item.name} item={item} />)}
                    </nav>
                </div>

                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Federal Database</h3>
                    <nav className="space-y-1">
                        {navigation.national.map((item) => <NavLink key={item.name} item={item} />)}
                    </nav>
                </div>

                <div>
                    <h3 className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Service</h3>
                    <nav className="space-y-1">
                        {navigation.system.map((item) => <NavLink key={item.name} item={item} />)}
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
