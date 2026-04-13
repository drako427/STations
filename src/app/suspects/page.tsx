"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Plus, Loader2, UserX, Clock, DollarSign, FileText } from "lucide-react";
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
    released?: boolean;
    released_at?: string;
    bail_amount?: number;
    timeout_hours?: number;
    has_case?: boolean;
    case_id?: number;
    case_name?: string;
}

interface SuspectsCacheEntry {
    data: Suspect[];
    token: string;
    fetchedAt: number;
}

const SUSPECTS_CACHE_TTL_MS = 5 * 60 * 1000;
let suspectsCache: SuspectsCacheEntry | null = null;

export default function MySuspects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [suspectList, setSuspectList] = useState<Suspect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReleaseFormOpen, setIsReleaseFormOpen] = useState(false);
    const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
    const [releaseForm, setReleaseForm] = useState({
        bail_amount: '',
        timeout_hours: '',
        use_bail: true,
        use_timeout: false
    });
    const [isCaseFormOpen, setIsCaseFormOpen] = useState(false);
    const [caseForm, setCaseForm] = useState({
        case_name: '',
        description: '',
        witness_name: '',
        crime_location: '',
        crime_type: '',
        past_crimes: ''
    });
    const normalizeSuspectsPayload = (payload: any): any[] => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.suspects)) return payload.suspects;
        console.error('Unexpected /api/suspects response shape:', payload);
        return [];
    };

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

            const hasValidCache =
                suspectsCache &&
                suspectsCache.token === token &&
                Date.now() - suspectsCache.fetchedAt < SUSPECTS_CACHE_TTL_MS;

            if (hasValidCache) {
                setSuspectList(suspectsCache.data);
                setError(null);
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch('/api/suspects', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📡 Suspects API response status:', response.status);
                console.log('📡 Suspects API response headers:', Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Suspects API error:', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorData
                    });
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const suspects = normalizeSuspectsPayload(data);
                
                // Transform database data to match component expectations
                const transformedData = suspects.map((suspect: any) => ({
                    ...suspect,
                    id: suspect.suspect_id || `S-00${suspect.suspect_id}`,
                    name: suspect.name || suspect.full_name || 'Unknown',
                    status: suspect.status || "Active Investigation",
                    risk: suspect.crime_type ? 'LOW' : 'MEDIUM', // Use crime_type as risk indicator
                    lastSeen: new Date(suspect.created_at || suspect.created_at).toLocaleDateString(),
                    location: suspect.location || suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                    image: suspect.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.name || suspect.full_name || 'Unknown'}`,
                }));

                console.log('🖼️ Transformed suspect data with images:', transformedData.map(s => ({ name: s.name, image: s.image })));

                setSuspectList(transformedData);
                suspectsCache = {
                    data: transformedData,
                    token,
                    fetchedAt: Date.now()
                };
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
            case "Released": return <UserX className="h-4 w-4 text-emerald-400" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const handleNewSuspect = async () => {
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
            
            const response = await fetch('/api/suspects', {
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
            const suspects = normalizeSuspectsPayload(data);
            
            // Transform database data to match component expectations
            const transformedData = suspects.map((suspect: any) => ({
                ...suspect,
                id: suspect.suspect_code || `S-00${suspect.suspect_id}`,
                name: suspect.name || suspect.full_name || 'Unknown',
                status: suspect.status || "Active Investigation",
                risk: suspect.risk_level ? suspect.risk_level.charAt(0).toUpperCase() + suspect.risk_level.slice(1) : 'Medium',
                lastSeen: new Date(suspect.created_at || suspect.created_at).toLocaleDateString(),
                location: suspect.location || suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                image: suspect.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.name || suspect.full_name || 'Unknown'}`,
                released: suspect.released || false,
                released_at: suspect.released_at || null,
                bail_amount: suspect.bail_amount || null,
                timeout_hours: suspect.timeout_hours || null
            }));

            setSuspectList(transformedData);
            suspectsCache = {
                data: transformedData,
                token,
                fetchedAt: Date.now()
            };
            setError(null);
        } catch (err: any) {
            console.error('❌ handleNewSuspect Error:', err);
            setError(err.message || 'Failed to load suspects');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseSuspect = (suspect: Suspect) => {
        setSelectedSuspect(suspect);
        setReleaseForm({
            bail_amount: '',
            timeout_hours: '',
            use_bail: true,
            use_timeout: false
        });
        setIsReleaseFormOpen(true);
    };

    const handleCreateCase = (suspect: Suspect) => {
        setSelectedSuspect(suspect);
        setCaseForm({
            case_name: '',
            description: '',
            witness_name: '',
            crime_location: '',
            crime_type: suspect.crime_committed || '',
            past_crimes: ''
        });
        setIsCaseFormOpen(true);
    };

    const handleReleaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSuspect) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found. Please login again.');
            return;
        }

        try {
            const releaseData = {
                suspect_id: selectedSuspect.suspect_id,
                bail_amount: releaseForm.use_bail ? parseFloat(releaseForm.bail_amount) || 0 : null,
                timeout_hours: releaseForm.use_timeout ? parseInt(releaseForm.timeout_hours) || 0 : null,
                released_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // Format: 'YYYY-MM-DD HH:MM:SS'
            };

            console.log('🔓 Releasing suspect:', releaseData);

            const response = await fetch('/api/suspects/release', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(releaseData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to release suspect');
            }

            // Update the local suspect list
            setSuspectList(prevList => {
                const updatedList = prevList.map(suspect => 
                    suspect.suspect_id === selectedSuspect.suspect_id 
                        ? { 
                            ...suspect, 
                            released: true, 
                            released_at: releaseData.released_at,
                            status: "Released",
                            bail_amount: releaseData.bail_amount,
                            timeout_hours: releaseData.timeout_hours
                        }
                        : suspect
                );

                suspectsCache = {
                    data: updatedList,
                    token,
                    fetchedAt: Date.now()
                };

                return updatedList;
            });

            setIsReleaseFormOpen(false);
            setSelectedSuspect(null);
            
        } catch (err: any) {
            console.error('❌ Release error:', err);
            setError(err.message || 'Failed to release suspect');
        }
    };

    const handleCaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSuspect) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found. Please login again.');
            return;
        }

        try {
            const caseData = {
                case_name: caseForm.case_name,
                description: caseForm.description,
                witness_name: caseForm.witness_name,
                crime_location: caseForm.crime_location,
                crime_type: caseForm.crime_type,
                past_crimes: caseForm.past_crimes,
                suspect_id: selectedSuspect.suspect_id,
                station_id: 2 // TODO: Get from token
            };

            console.log('� Case data being sent:', JSON.stringify(caseData, null, 2));

            const response = await fetch('/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(caseData)
            });

            console.log('🔍 Response status:', response.status);
            console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Error response:', errorData);
                throw new Error(errorData.error || 'Failed to create case');
            }

            const result = await response.json();
            console.log('✅ Case created successfully:', result);

            // Update the local suspect list with case information
            setSuspectList(prevList => {
                const updatedList = prevList.map(suspect => 
                    suspect.suspect_id === selectedSuspect.suspect_id 
                        ? { 
                            ...suspect, 
                            has_case: true,
                            case_id: result.case_id,
                            case_name: caseForm.case_name
                        }
                        : suspect
                );

                suspectsCache = {
                    data: updatedList,
                    token,
                    fetchedAt: Date.now()
                };

                return updatedList;
            });

            setIsCaseFormOpen(false);
            setSelectedSuspect(null);
            
            // Show success message
            alert(`Case "${caseForm.case_name}" created successfully! Case ID: ${result.case_id}`);
            
        } catch (err: any) {
            console.error('❌ Case creation error:', err);
            setError(err.message || 'Failed to create case');
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

            {/* Suspects Containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {suspectList.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((suspect, index) => (
                    <div key={suspect.id || `suspect-${index}`} className="glass-card p-4 hover:border-primary/50 transition-all group">
                        {/* Suspect Image */}
                        <div className="aspect-square bg-surface/50 rounded-lg mb-4 overflow-hidden">
                            <img 
                                src={suspect.image ? `http://localhost:5000${suspect.image}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.name || 'Unknown'}`}
                                alt={suspect.name || 'Unknown'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.name || 'Unknown'}`;
                                }}
                            />
                        </div>

                        {/* Suspect Details */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white text-sm line-clamp-2">{suspect.name || 'Unknown'}</h3>
                                    <p className="text-xs text-muted mt-1">{suspect.id || ''}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(suspect.status || '')}
                                    <span className="text-xs text-muted">{suspect.status || 'Unknown'}</span>
                                </div>
                            </div>
                            
                            <p className="text-muted text-xs line-clamp-2">{suspect.crime_committed || 'No crime information'}</p>
                            
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium border",
                                    getRiskColor(suspect.risk || 'Medium')
                                )}>
                                    {suspect.risk || 'Medium'}
                                </span>
                                <span className="text-xs text-muted">{suspect.lastSeen || 'Unknown'}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                    {suspect.released && (
                                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300 flex items-center gap-1 shadow-lg shadow-emerald-500/25">
                                            <UserX className="h-3 w-3" />
                                            Released
                                        </span>
                                    )}
                                    {suspect.has_case && (
                                        <span className="px-2 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-medium text-amber-300 flex items-center gap-1 shadow-lg shadow-amber-500/25">
                                            <FileText className="h-3 w-3" />
                                            Case Open
                                        </span>
                                    )}
                                    <span className="text-xs text-muted">{suspect.location || 'Unknown'}</span>
                                </div>
                                <div className="flex gap-1">
                                    {!suspect.released && (
                                        <button 
                                            onClick={() => handleReleaseSuspect(suspect)}
                                            className="p-1.5 text-muted hover:text-emerald-400 transition-colors hover:bg-emerald-400/10 rounded-lg"
                                            title="Release Suspect"
                                        >
                                            <UserX className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {!suspect.has_case && (
                                        <button 
                                            onClick={() => handleCreateCase(suspect)}
                                            className="p-1.5 text-muted hover:text-blue-400 transition-colors hover:bg-blue-400/10 rounded-lg"
                                            title="Create Case"
                                        >
                                            <FileText className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    <button className="p-1.5 text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="p-1.5 text-muted hover:text-white transition-colors">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <RegisterSuspectForm
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={handleNewSuspect}
            />

            {/* Release Form Modal */}
            {isReleaseFormOpen && selectedSuspect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <UserX className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Release Suspect</h2>
                                    <p className="text-sm text-muted">{selectedSuspect.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReleaseFormOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleReleaseSubmit} className="p-6 space-y-4">
                            {/* Bail Option */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-white">
                                    <input
                                        type="checkbox"
                                        checked={releaseForm.use_bail}
                                        onChange={(e) => setReleaseForm(prev => ({ ...prev, use_bail: e.target.checked }))}
                                        className="rounded border-border bg-white/5 text-primary focus:ring-2 focus:ring-primary/50"
                                    />
                                    <DollarSign className="h-4 w-4" />
                                    Set Bail Amount
                                </label>
                                {releaseForm.use_bail && (
                                    <input
                                        type="number"
                                        placeholder="Enter bail amount"
                                        value={releaseForm.bail_amount}
                                        onChange={(e) => setReleaseForm(prev => ({ ...prev, bail_amount: e.target.value }))}
                                        className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        step="0.01"
                                        min="0"
                                    />
                                )}
                            </div>

                            {/* Timeout Option */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-white">
                                    <input
                                        type="checkbox"
                                        checked={releaseForm.use_timeout}
                                        onChange={(e) => setReleaseForm(prev => ({ ...prev, use_timeout: e.target.checked }))}
                                        className="rounded border-border bg-white/5 text-primary focus:ring-2 focus:ring-primary/50"
                                    />
                                    <Clock className="h-4 w-4" />
                                    Set Timeout Period
                                </label>
                                {releaseForm.use_timeout && (
                                    <input
                                        type="number"
                                        placeholder="Enter timeout hours"
                                        value={releaseForm.timeout_hours}
                                        onChange={(e) => setReleaseForm(prev => ({ ...prev, timeout_hours: e.target.value }))}
                                        className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        min="1"
                                    />
                                )}
                            </div>

                            {/* Warning */}
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-xs text-amber-400">
                                    ⚠️ This action will mark the suspect as released and update their status. This action cannot be undone.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReleaseFormOpen(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                                >
                                    Release Suspect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Case Creation Form Modal */}
            {isCaseFormOpen && selectedSuspect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Create Case</h2>
                                    <p className="text-sm text-muted">For: {selectedSuspect.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCaseFormOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCaseSubmit} className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {/* Case Name - Required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Case Name <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter case name"
                                    value={caseForm.case_name}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, case_name: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>

                            {/* Description - Required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Description <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    placeholder="Enter case description"
                                    value={caseForm.description}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Witness Name - Required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Witness Name <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter witness name"
                                    value={caseForm.witness_name}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, witness_name: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>

                            {/* Location of Crime - Required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Location of Crime <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter crime location"
                                    value={caseForm.crime_location}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, crime_location: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>

                            {/* Crime Type - Required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Crime <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter crime type"
                                    value={caseForm.crime_type}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, crime_type: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>

                            {/* Past Crimes - Optional */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Past Crimes <span className="text-muted text-xs">(Optional)</span>
                                </label>
                                <textarea
                                    placeholder="Enter past crimes (if any)"
                                    value={caseForm.past_crimes}
                                    onChange={(e) => setCaseForm(prev => ({ ...prev, past_crimes: e.target.value }))}
                                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsCaseFormOpen(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Create Case
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
