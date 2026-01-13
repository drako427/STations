"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegisterSuspectForm } from "@/components/suspects/RegisterSuspectForm";

interface Suspect {
    suspect_id: number;
    full_name: string;
    crime_committed: string;
    physical_description: string;
    risk_level: 'low' | 'medium' | 'high';
    created_at: string;
    suspect_code?: string;
    status?: string;
    lastSeen?: string;
    location?: string;
    image?: string;
    id?: string;
    name?: string;
    risk?: string;
}

export default function MySuspects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [suspectList, setSuspectList] = useState<Suspect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch suspects from database
    useEffect(() => {
        const fetchSuspects = async () => {
            const token = localStorage.getItem('token');
            console.log('🔍 Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/suspects/suspects', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📡 Suspects API response status:', response.status);
                console.log('📡 Suspects API response headers:', response.headers);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Suspects API error:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch suspects');
                }

                const data = await response.json();
                
                // Transform database data to match component expectations
                const transformedData = data.map((suspect: any) => ({
                    ...suspect,
                    id: suspect.suspect_code || `S-00${suspect.suspect_id}`,
                    name: suspect.full_name,
                    status: "Active Investigation",
                    risk: suspect.risk_level.charAt(0).toUpperCase() + suspect.risk_level.slice(1),
                    lastSeen: new Date(suspect.created_at).toLocaleDateString(),
                    location: suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.full_name}`
                }));

                setSuspectList(transformedData);
            } catch (err: any) {
                console.error('Error fetching suspects:', err);
                setError(err.message || 'Failed to load suspects');
            } finally {
                setLoading(false);
            }
        };

        fetchSuspects();
    }, []);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "High": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            case "Medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            default: return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Active Investigation": return <ShieldAlert className="h-4 w-4" />;
            case "Apprehended": return <CheckCircle2 className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const handleNewSuspect = async (newSuspectData: any) => {
        // Refresh the suspects list to show the new suspect
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 handleNewSuspect - Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }
            
            const response = await fetch('http://localhost:5000/api/suspects/suspects', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 handleNewSuspect API response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ handleNewSuspect API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch suspects');
            }

            const data = await response.json();
            
            // Transform database data to match component expectations
            const transformedData = data.map((suspect: any) => ({
                ...suspect,
                id: suspect.suspect_code || `S-00${suspect.suspect_id}`,
                name: suspect.full_name,
                status: "Active Investigation",
                risk: suspect.risk_level.charAt(0).toUpperCase() + suspect.risk_level.slice(1),
                lastSeen: new Date(suspect.created_at).toLocaleDateString(),
                location: suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.full_name}`
            }));

            setSuspectList(transformedData);
        } catch (err: any) {
            console.error('Error refreshing suspects:', err);
            setError(err.message || 'Failed to refresh suspects');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted animate-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Loading suspect database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-rose-400 animate-in">
                <AlertTriangle className="h-12 w-12" />
                <p className="text-lg font-bold uppercase tracking-widest">Database Connection Failed</p>
                <p className="text-sm text-muted max-w-md text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all"
                >
                    RETRY CONNECTION
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">Suspect Directory</h1>
                    <p className="text-muted mt-1">Manage and track individuals under investigation.</p>
                </div>
                <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 w-fit leading-tight"
                >
                    <Plus className="h-4 w-4" />
                    Register New Suspect
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or location..."
                        className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Suspects Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Suspect</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Risk Level</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Last Seen</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {suspectList.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((suspect) => (
                                <tr key={suspect.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={suspect.image || ''} alt={suspect.name || 'Unknown'} className="h-10 w-10 rounded-full border border-border bg-white/5" />
                                            <div>
                                                <div className="text-sm font-medium text-white">{suspect.name || 'Unknown'}</div>
                                                <div className="text-xs text-muted leading-tight">{suspect.id || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <span className="text-primary">{getStatusIcon(suspect.status || '')}</span>
                                            {suspect.status || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            getRiskColor(suspect.risk || 'Medium')
                                        )}>
                                            {suspect.risk || 'Medium'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">{suspect.lastSeen || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{suspect.location || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-muted hover:text-white transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <RegisterSuspectForm
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={handleNewSuspect}
            />
        </div>
    );
}
