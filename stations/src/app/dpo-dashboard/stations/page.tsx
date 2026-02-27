"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Activity, Users, ShieldCheck, MapPin, Phone, Mail, Search, Filter, MoreVertical, Eye, AlertTriangle, X, Key, Copy } from "lucide-react";

interface Station {
    station_id: number;
    station_name: string;
    station_code: string;
    location: string;
    sector: string;
    jurisdiction_type: string;
    contact_phone: string;
    contact_email: string;
    status: 'active' | 'inactive' | 'maintenance';
    agent_count: number;
    case_count: number;
    suspect_count: number;
    access_code?: string;
}

export default function DPOStationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all");
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        name: ""
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleRegisterStation = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError("");

        try {
            // Get next station ID for proper code generation
            const nextId = stations.length > 0 ? Math.max(...stations.map(s => s.station_id)) + 1 : 1;
            
            const response = await fetch('/api/stations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: registerForm.name,
                    code: `STN-${String(nextId).padStart(3, '0')}`,
                    location: "To be updated",
                    sector: "To be updated",
                    jurisdiction_type: "local",
                    phone: "To be updated",
                    email: "To be updated",
                    address: "To be updated"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register station');
            }

            // Show access code
            setAccessCode(data.access_code);
            setShowAccessCode(true);

            // Close modal and reset form
            setIsRegisterOpen(false);
            setRegisterForm({
                name: ""
            });

            // Refresh stations list
            const fetchResponse = await fetch('/api/stations');
            const stationsData = await fetchResponse.json();
            const transformedStations: Station[] = stationsData.map((station: any) => ({
                station_id: station.station_id,
                station_name: station.station_name,
                station_code: station.station_code,
                location: station.location,
                sector: station.sector || 'Unknown',
                jurisdiction_type: station.jurisdiction_type || 'local',
                contact_phone: station.contact_phone || 'Not provided',
                contact_email: station.contact_email || 'Not provided',
                status: 'active',
                agent_count: Math.floor(Math.random() * 50) + 10,
                case_count: Math.floor(Math.random() * 100) + 20,
                suspect_count: Math.floor(Math.random() * 80) + 10,
                access_code: station.access_code,
            }));
            setStations(transformedStations);

        } catch (err: any) {
            setRegisterError(err.message || 'Failed to register station');
        } finally {
            setRegisterLoading(false);
        }
    };

    useEffect(() => {
        const fetchStations = async () => {
            try {
                setLoading(true);
                // Fetch real stations from database
                const response = await fetch('/api/stations', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stations');
                }

                const data = await response.json();
                
                console.log('🔍 Raw stations data from API:', data);
                
                // Transform database data to match component interface
                const transformedStations: Station[] = data.map((station: any) => ({
                    station_id: station.station_id,
                    station_name: station.station_name,
                    station_code: station.station_code,
                    location: station.location,
                    sector: station.sector || 'Unknown',
                    jurisdiction_type: station.jurisdiction_type || 'local',
                    contact_phone: station.contact_phone || 'Not provided',
                    contact_email: station.contact_email || 'Not provided',
                    status: 'active', // Default to active since we don't have status in database
                    agent_count: Math.floor(Math.random() * 50) + 10, // Random for now
                    case_count: Math.floor(Math.random() * 100) + 20, // Random for now
                    suspect_count: Math.floor(Math.random() * 80) + 10, // Random for now
                    access_code: station.access_code,
                }));
                
                console.log('🔍 Transformed stations data:', transformedStations);
                
                setStations(transformedStations);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load stations data');
                console.error('Error fetching stations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "maintenance": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            default: return "text-rose-400 bg-rose-400/10 border-rose-400/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <Activity className="h-4 w-4" />;
            case "maintenance": return <AlertTriangle className="h-4 w-4" />;
            default: return <ShieldCheck className="h-4 w-4" />;
        }
    };

    const filteredStations = stations.filter(station => {
        const matchesSearch = station.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             station.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             station.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || station.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeCount = stations.filter(s => s.status === "active").length;
    const maintenanceCount = stations.filter(s => s.status === "maintenance").length;
    const inactiveCount = stations.filter(s => s.status === "inactive").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                    <div className="h-12 w-12 border-2 border-amber-400 border-t-amber-400 animate-spin rounded-full mx-auto" />
                    <p className="text-amber-400">Loading stations data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-rose-400 text-center space-y-4">
                    <Building2 className="h-12 w-12 mx-auto" />
                    <p className="text-lg font-bold">Stations System Error</p>
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
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">All Stations</h1>
                    <p className="text-muted mt-1">Complete overview of all police stations under DPO jurisdiction</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">DPO Access</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 border-l-4 border-l-green-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{activeCount}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Active Stations</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-amber-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                            <AlertTriangle className="h-6 w-6 text-amber-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{maintenanceCount}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Maintenance</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-rose-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
                            <ShieldCheck className="h-6 w-6 text-rose-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{inactiveCount}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Inactive</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-amber-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                            <Building2 className="h-6 w-6 text-amber-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{stations.length}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Stations</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search stations by name, code, or location..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsRegisterOpen(true)}
                        className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2"
                    >
                        <Building2 className="h-4 w-4" />
                        Register Station
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === "all" 
                                ? "bg-amber-400/10 border border-amber-400/20 text-amber-400" 
                                : "bg-white/5 border border-border text-muted hover:bg-white/10"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === "active" 
                                ? "bg-green-400/10 border border-green-400/20 text-green-400" 
                                : "bg-white/5 border border-border text-muted hover:bg-white/10"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter("maintenance")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === "maintenance" 
                                ? "bg-amber-400/10 border border-amber-400/20 text-amber-400" 
                                : "bg-white/5 border border-border text-muted hover:bg-white/10"
                        }`}
                    >
                        Maintenance
                    </button>
                    <button
                        onClick={() => setStatusFilter("inactive")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === "inactive" 
                                ? "bg-rose-400/10 border border-rose-400/20 text-rose-400" 
                                : "bg-white/5 border border-border text-muted hover:bg-white/10"
                        }`}
                    >
                        Inactive
                    </button>
                </div>
            </div>

            {/* Register Station Modal */}
            {isRegisterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Register New Station</h3>
                                    <p className="text-xs text-muted">Add a new police station to the system</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsRegisterOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegisterStation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Station Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter station name"
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                                    value={registerForm.name}
                                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                />
                            </div>

                            {registerError && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                    <p className="text-sm text-rose-400">{registerError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 border border-border text-white rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={registerLoading}
                                    className="flex-1 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-all disabled:opacity-50"
                                >
                                    {registerLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 border-2 border-amber-400 border-t-amber-400 animate-spin rounded-full" />
                                            Registering...
                                        </span>
                                    ) : (
                                        'Register Station'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Access Code Success Modal */}
            {showAccessCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="text-center space-y-6">
                            <div className="h-16 w-16 rounded-xl bg-green-500 bg-opacity-10 flex items-center justify-center mx-auto">
                                <ShieldCheck className="h-8 w-8 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Station Registered Successfully!</h3>
                                <p className="text-sm text-gray-400 mb-4">Share this access code with the station:</p>
                                <div className="bg-white border border-gray-300 rounded-lg p-4 relative">
                                    <div className="text-2xl font-mono font-bold text-black tracking-widest break-all">
                                        {accessCode || 'No Code'}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(accessCode)}
                                        className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
                                        title="Copy access code"
                                    >
                                        {copied ? (
                                            <div className="flex items-center gap-1">
                                                <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Copy className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">
                                    {copied ? '✅ Copied to clipboard!' : 'This code is required for station login'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => copyToClipboard(accessCode)}
                                    className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 text-gray-600" />
                                            Copy Code
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowAccessCode(false)}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Stations Grid - Square Containers */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStations.map((station) => (
                    <div key={station.station_id} className="glass-card p-6 hover:border-amber-400/50 transition-all group">
                        {/* Station Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-400/10 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                                    <Building2 className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white line-clamp-1">{station.station_name}</h3>
                                    <p className="text-xs text-muted">{station.station_code}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-amber-400">{getStatusIcon(station.status)}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(station.status)}`}>
                                    {station.status}
                                </span>
                            </div>
                        </div>

                        {/* Access Code */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-amber-500/20 flex items-center justify-center">
                                    <Key className="h-3 w-3 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-mono font-bold text-amber-400 tracking-widest break-all">
                                        {station.access_code || 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted">Access Code</div>
                                </div>
                                {station.access_code && (
                                    <button
                                        onClick={() => copyToClipboard(station.access_code!)}
                                        className="p-1 bg-amber-500/10 hover:bg-amber-500/20 rounded transition-colors group"
                                        title="Copy access code"
                                    >
                                        {copied && accessCode === station.access_code ? (
                                            <div className="w-3 h-3 bg-green-400 rounded-sm flex items-center justify-center">
                                                <div className="w-1 h-1 bg-black rounded-full"></div>
                                            </div>
                                        ) : (
                                            <Copy className="h-3 w-3 text-amber-400 group-hover:text-amber-300" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{station.location}</span>
                            </div>
                            <div className="text-xs text-muted">{station.sector}</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-sm font-bold text-white">{station.agent_count}</div>
                                <div className="text-xs text-muted">Agents</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-sm font-bold text-white">{station.case_count}</div>
                                <div className="text-xs text-muted">Cases</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-sm font-bold text-white">{station.suspect_count}</div>
                                <div className="text-xs text-muted">Suspects</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-border">
                            <button className="p-2 text-muted hover:text-amber-400 transition-colors hover:bg-amber-400/10 rounded-lg">
                                <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-muted hover:text-white transition-colors hover:bg-white/10 rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
