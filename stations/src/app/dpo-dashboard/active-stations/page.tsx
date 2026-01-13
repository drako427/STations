"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Activity, Users, ShieldCheck, MapPin, Phone, Mail, Search, Eye, MoreVertical, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface ActiveStation {
    station_id: number;
    station_name: string;
    station_code: string;
    location: string;
    sector: string;
    contact_phone: string;
    contact_email: string;
    agent_count: number;
    case_count: number;
    suspect_count: number;
    last_activity: string;
    response_time: string;
    active_cases: number;
    emergency_response: boolean;
}

export default function DPOActiveStationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stations, setStations] = useState<ActiveStation[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchActiveStations = async () => {
            try {
                setLoading(true);
                // Mock data for active stations
                const mockActiveStations: ActiveStation[] = [
                    {
                        station_id: 1,
                        station_name: "Central Police Station",
                        station_code: "STN-001",
                        location: "123 Main Street, Downtown",
                        sector: "Central District",
                        contact_phone: "+1-555-0101",
                        contact_email: "central@stations.gov",
                        agent_count: 45,
                        case_count: 127,
                        suspect_count: 89,
                        last_activity: "2 mins ago",
                        response_time: "3.2 min",
                        active_cases: 12,
                        emergency_response: true
                    },
                    {
                        station_id: 2,
                        station_name: "North District Station",
                        station_code: "STN-002",
                        location: "456 Oak Avenue, North Side",
                        sector: "North District",
                        contact_phone: "+1-555-0102",
                        contact_email: "north@stations.gov",
                        agent_count: 32,
                        case_count: 98,
                        suspect_count: 67,
                        last_activity: "5 mins ago",
                        response_time: "4.1 min",
                        active_cases: 8,
                        emergency_response: false
                    },
                    {
                        station_id: 4,
                        station_name: "West Precinct",
                        station_code: "STN-004",
                        location: "321 Elm Street, West Side",
                        sector: "West District",
                        contact_phone: "+1-555-0104",
                        contact_email: "west@stations.gov",
                        agent_count: 38,
                        case_count: 112,
                        suspect_count: 78,
                        last_activity: "12 mins ago",
                        response_time: "2.8 min",
                        active_cases: 15,
                        emergency_response: true
                    }
                ];
                setStations(mockActiveStations);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load active stations data');
            } finally {
                setLoading(false);
            }
        };
        fetchActiveStations();
    }, []);

    const filteredStations = stations.filter(station => 
        station.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAgents = stations.reduce((sum, station) => sum + station.agent_count, 0);
    const totalActiveCases = stations.reduce((sum, station) => sum + station.active_cases, 0);
    const avgResponseTime = stations.length > 0 
        ? (stations.reduce((sum, station) => sum + parseFloat(station.response_time), 0) / stations.length).toFixed(1)
        : "0.0";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                    <div className="h-12 w-12 border-2 border-green-400 border-t-green-400 animate-spin rounded-full mx-auto" />
                    <p className="text-green-400">Loading active stations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-rose-400 text-center space-y-4">
                    <Activity className="h-12 w-12 mx-auto" />
                    <p className="text-lg font-bold">Active Stations Error</p>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">Active Stations</h1>
                    <p className="text-muted mt-1">Real-time monitoring of operational police stations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">LIVE</span>
                    </div>
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">DPO Access</span>
                    </div>
                </div>
            </div>

            {/* Active Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 border-l-4 border-l-green-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{stations.length}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Active Stations</p>
                        <p className="text-xs text-green-400 mt-1">Operational now</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-amber-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                            <Users className="h-6 w-6 text-amber-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{totalAgents}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Active Agents</p>
                        <p className="text-xs text-amber-400 mt-1">On duty</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-blue-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
                            <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{avgResponseTime} min</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Avg Response</p>
                        <p className="text-xs text-blue-400 mt-1">Emergency time</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-rose-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
                            <AlertCircle className="h-6 w-6 text-rose-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{totalActiveCases}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Active Cases</p>
                        <p className="text-xs text-rose-400 mt-1">Currently open</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                    type="text"
                    placeholder="Search active stations..."
                    className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Active Stations Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredStations.map((station) => (
                    <div key={station.station_id} className="glass-card p-6 hover:border-green-400/50 transition-all group">
                        {/* Station Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-green-400/10 flex items-center justify-center group-hover:bg-green-400/20 transition-colors">
                                    <Building2 className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{station.station_name}</h3>
                                    <p className="text-xs text-muted">{station.station_code}</p>
                                </div>
                            </div>
                            {station.emergency_response && (
                                <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                    <span className="text-[10px] font-bold text-rose-400">EMERGENCY</span>
                                </div>
                            )}
                        </div>

                        {/* Station Details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted">
                                <MapPin className="h-4 w-4" />
                                {station.location}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted">
                                <Clock className="h-4 w-4" />
                                Last activity: {station.last_activity}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <TrendingUp className="h-4 w-4" />
                                Response time: {station.response_time}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{station.agent_count}</div>
                                <div className="text-xs text-muted">Agents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{station.active_cases}</div>
                                <div className="text-xs text-muted">Active</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{station.suspect_count}</div>
                                <div className="text-xs text-muted">Suspects</div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Phone className="h-3 w-3" />
                                {station.contact_phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Mail className="h-3 w-3" />
                                {station.contact_email}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                            <button className="p-2 text-muted hover:text-green-400 transition-colors hover:bg-green-400/10 rounded-lg">
                                <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-muted hover:text-white transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredStations.length === 0 && !loading && (
                <div className="glass-card p-12 text-center">
                    <Activity className="h-12 w-12 text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Active Stations Found</h3>
                    <p className="text-muted">No stations match your search criteria.</p>
                </div>
            )}
        </div>
    );
}
