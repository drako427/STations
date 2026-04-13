"use client";

import { ShieldCheck, Globe, Users, FileBarChart, Siren, Building2 } from "lucide-react";

export default function DPODashboard() {
    const nationalStats = [
        { name: "Total Jurisdictions", value: "42", icon: Building2 },
        { name: "Active Agents", value: "1,248", icon: Users },
        { name: "National Suspect DB", value: "15,802", icon: ShieldCheck },
        { name: "Global Alerts", value: "3", icon: Siren, variant: "urgent" },
    ];

    return (
        <div className="space-y-8 animate-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">Central Command (DPO)</h1>
                    <p className="text-muted mt-1">Multi-jurisdictional oversight and national statistics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Encryption Active</span>
                    </div>
                </div>
            </div>

            {/* National Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {nationalStats.map((stat) => (
                    <div key={stat.name} className="glass-card p-6 border-l-4 border-l-primary/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            {stat.variant === "urgent" && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 animate-pulse">
                                    PRIORITY
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted">{stat.name}</p>
                            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Command Visualizer (Placeholder) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="glass-card p-12 lg:col-span-3 flex flex-col items-center justify-center text-center space-y-4 bg-primary/5 min-h-[400px] border-dashed border-primary/20">
                    <Globe className="h-24 w-24 text-primary/30 animate-spin-slow" />
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">National Jurisdiction Map</h3>
                        <p className="text-muted text-sm max-w-sm">
                            Connecting to federal database nodes. Visualizing regional criminal density and active investigation heatmaps.
                        </p>
                    </div>
                    <div className="mt-8 flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1 w-8 bg-primary/20 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
