"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Globe, Users, FileBarChart, Siren, Building2, Activity, AlertTriangle, TrendingUp, MapPin, FileText, UserCheck, Scale } from "lucide-react";

export default function DPODashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch real data from API
                const [stationsResponse, dashboardResponse] = await Promise.all([
                    fetch('/api/stations', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('/api/dashboard', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

                if (!stationsResponse.ok) {
                    throw new Error('Failed to fetch stations data');
                }

                const stationsData = await stationsResponse.json();
                const totalStations = Array.isArray(stationsData) ? stationsData.length : 0;
                
                // Calculate active stations (stations with recent activity)
                // For now, consider all stations as active since we don't have activity tracking yet
                const activeStations = totalStations;

                const dashboardData = {
                    totalStations: totalStations,
                    activeStations: activeStations,
                    totalAgents: totalStations * 31, // Average 31 agents per station
                    nationalSuspects: 15802, // This would come from a national API
                    globalAlerts: 3,
                    recentActivity: Array.isArray(stationsData) ? stationsData.slice(0, 3).map(station => ({
                        station: station.station_name || 'Unknown Station',
                        status: "active",
                        lastUpdate: "Just now"
                    })) : [
                        { station: "DPO Headquarters", status: "active", lastUpdate: "2 mins ago" },
                        { station: "Wellingara Station", status: "active", lastUpdate: "5 mins ago" },
                        { station: "Banjul Station", status: "active", lastUpdate: "15 mins ago" }
                    ],
                    trends: {
                        suspectsUp: 12,
                        casesUp: 8,
                        alertsUp: 3
                    }
                };
                
                setData(dashboardData);
                setError(null);
            } catch (err: any) {
                console.error('DPO Dashboard Error:', err);
                setError(err.message || 'Failed to load DPO dashboard data');
                
                // Fallback to mock data with corrected numbers
                const fallbackData = {
                    totalStations: 4,
                    activeStations: 4,
                    totalAgents: 124,
                    nationalSuspects: 15802,
                    globalAlerts: 3,
                    recentActivity: [
                        { station: "DPO Headquarters", status: "active", lastUpdate: "2 mins ago" },
                        { station: "Wellingara Station", status: "active", lastUpdate: "5 mins ago" },
                        { station: "Banjul Station", status: "active", lastUpdate: "15 mins ago" }
                    ],
                    trends: {
                        suspectsUp: 12,
                        casesUp: 8,
                        alertsUp: 3
                    }
                };
                setData(fallbackData);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const nationalStats = [
        { name: "Total Jurisdictions", value: data?.totalStations || "4", icon: Building2 },
        { name: "Active Stations", value: data?.activeStations || "4", icon: Activity },
        { name: "National Agents", value: data?.totalAgents || "124", icon: Users },
        { name: "Global Alerts", value: data?.globalAlerts || "3", icon: Siren, variant: "urgent" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                    <div className="h-12 w-12 border-2 border-amber-400 border-t-amber-400 animate-spin rounded-full mx-auto" />
                    <p className="text-amber-400">Loading DPO Command Center...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-rose-400 text-center space-y-4">
                    <ShieldCheck className="h-12 w-12 mx-auto" />
                    <p className="text-lg font-bold">DPO System Error</p>
                    <p className="text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all"
                    >
                        RETRY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in">
            {/* DPO Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">DPO Command Center</h1>
                    <p className="text-muted mt-1">Department of Police Operations - National Oversight</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">DPO Access</span>
                    </div>
                </div>
            </div>

            {/* National Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {nationalStats.map((stat) => (
                    <div 
                        key={stat.name} 
                        className={`glass-card p-6 border-l-4 ${stat.variant === "urgent" ? "border-l-rose-400" : "border-l-amber-400/50"} ${stat.onClick ? 'cursor-pointer hover:border-amber-400/70 transition-all' : ''}`}
                        onClick={stat.onClick}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.variant === "urgent" ? "bg-rose-500/10 border border-rose-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
                                <stat.icon className={`h-6 w-6 ${stat.variant === "urgent" ? "text-rose-400" : "text-amber-400"}`} />
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="glass-card p-6 hover:border-amber-400/50 transition-all cursor-pointer" onClick={() => router.push('/dpo-dashboard/stations')}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">All Stations</h3>
                            <p className="text-sm text-muted">View and manage all police stations</p>
                        </div>
                        <div className="text-amber-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover:border-green-400/50 transition-all cursor-pointer" onClick={() => router.push('/dpo-dashboard/active-stations')}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Active Stations</h3>
                            <p className="text-sm text-muted">Currently operational stations</p>
                        </div>
                        <div className="text-green-400">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover:border-purple-400/50 transition-all cursor-pointer" onClick={() => router.push('/dpo-dashboard/officers')}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Officers</h3>
                            <p className="text-sm text-muted">National officer management</p>
                        </div>
                        <div className="text-purple-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover:border-rose-400/50 transition-all cursor-pointer" onClick={() => router.push('/dpo-dashboard/crimes')}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-rose-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Crimes</h3>
                            <p className="text-sm text-muted">National crime database</p>
                        </div>
                        <div className="text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 hover:border-blue-400/50 transition-all cursor-pointer" onClick={() => router.push('/dpo-dashboard/reports')}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Reports</h3>
                            <p className="text-sm text-muted">National reports and analytics</p>
                        </div>
                        <div className="text-blue-400">
                            <FileBarChart className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Station Activity</h3>
                <div className="space-y-3">
                    {data?.recentActivity?.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${activity.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                <span className="text-sm text-white">{activity.station}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${activity.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-amber-400/10 text-amber-400'}`}>
                                    {activity.status}
                                </span>
                                <span className="text-xs text-muted">{activity.lastUpdate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Command Visualizer (Placeholder) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="glass-card p-12 lg:col-span-3 flex flex-col items-center justify-center text-center space-y-4 bg-amber-500/5 min-h-[400px] border-dashed border-amber-400/20">
                    <Globe className="h-24 w-24 text-amber-400/30 animate-spin-slow" />
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-amber-400 uppercase tracking-widest">National Jurisdiction Map</h3>
                        <p className="text-muted text-sm max-w-sm">
                            Connecting to federal database nodes. Visualizing regional criminal density and active investigation heatmaps.
                        </p>
                    </div>
                    <div className="mt-8 flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1 w-8 bg-amber-400/20 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
