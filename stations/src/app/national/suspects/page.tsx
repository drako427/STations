"use client";

import { useState, useEffect } from "react";
import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Globe, ShieldAlert, Scale, X, Search, Filter, MoreVertical, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function NationalSuspectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suspectList, setSuspectList] = useState<Suspect[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            case "Apprehended": return <Scale className="h-4 w-4" />;
            default: return <ShieldAlert className="h-4 w-4" />;
        }
    };

    const fetchSuspects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/suspects/suspects', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suspects');
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

    const openModal = () => {
        setIsModalOpen(true);
        fetchSuspects();
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Single horizontal station container */}
            <div className="glass-card p-6 border-border/50 hover:border-primary/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <ShieldAlert className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Federal Station</span>
                                <div className="h-1 w-1 rounded-full bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sector 1</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Central Intelligence Hub</h3>
                            <p className="text-sm text-muted mt-1">
                                Primary coordination center for cross-jurisdictional suspect tracking and federal watchlists.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={openModal}
                        className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]"
                    >
                        View Suspects
                    </button>
                </div>
            </div>

            {/* Horizontal divider and footer text */}
            <div className="pt-12">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted mt-6 animate-pulse">
                    View other station suspect
                </p>
            </div>

            {/* Suspects Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">National Suspect Database</h2>
                                    <p className="text-xs text-muted leading-tight">Federal watchlist and cross-jurisdictional tracking.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-border">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, ID, or location..."
                                        className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-sm font-medium animate-pulse">Loading federal database...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-rose-400">
                                    <ShieldAlert className="h-12 w-12" />
                                    <p className="text-lg font-bold uppercase tracking-widest">Database Connection Failed</p>
                                    <p className="text-sm text-muted max-w-md text-center">{error}</p>
                                    <button
                                        onClick={fetchSuspects}
                                        className="mt-4 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all"
                                    >
                                        RETRY CONNECTION
                                    </button>
                                </div>
                            )}

                            {/* Suspects Table */}
                            {!loading && !error && (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 border-b border-border sticky top-0">
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
