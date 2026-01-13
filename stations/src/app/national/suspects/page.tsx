"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { ShieldAlert, Scale, X, Search, Loader2, Eye, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { StationContainer } from "@/components/shared/StationContainer";

interface Station {
    station_id: number;
    station_name: string;
    station_code: string;
    location?: string;
    sector?: string;
    jurisdiction_type?: string;
}

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
    const searchParams = useSearchParams();
    const isFromDPO = searchParams.get('from') === 'dpo';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suspectList, setSuspectList] = useState<Suspect[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [stations, setStations] = useState<Station[]>([]);
    const [myStation, setMyStation] = useState<Station | null>(null);
    const [otherStations, setOtherStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<{id: number, name: string} | null>(null);
    const [stationsLoading, setStationsLoading] = useState(true);
    const [stationSuspectCounts, setStationSuspectCounts] = useState<{[key: number]: number}>({});

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

    // Fetch all stations and separate my station from others
    useEffect(() => {
        const fetchStations = async () => {
            // Only run on client side
            if (typeof window === 'undefined') return;
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                setStationsLoading(false);
                return;
            }

            try {
                // Decode token to get user's station_id
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                const userStationId = tokenPayload.station_id;

                // Fetch all stations
                const response = await fetch('http://localhost:5000/api/stations', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stations');
                }

                const allStations: Station[] = await response.json();
                
                // Separate my station from other stations
                const myStationData = allStations.find(s => s.station_id === userStationId);
                const otherStationsData = allStations.filter(s => s.station_id !== userStationId);
                
                setMyStation(myStationData || null);
                setOtherStations(otherStationsData);
                setStations(allStations);

                // Fetch suspect counts for each station
                await fetchSuspectCounts(allStations, token);

            } catch (err: any) {
                console.error('Error fetching stations:', err);
                setError(err.message || 'Failed to load stations');
            } finally {
                setStationsLoading(false);
            }
        };

        fetchStations();
    }, []);

    // Fetch suspect counts for all stations
    const fetchSuspectCounts = async (stationsList: Station[], token: string) => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const counts: {[key: number]: number} = {};
        
        for (const station of stationsList) {
            try {
                const response = await fetch(`http://localhost:5000/api/suspects/station/${station.station_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const suspects = await response.json();
                    counts[station.station_id] = suspects.length;
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Error fetching suspect count for station ${station.station_id}:`, response.status, errorText);
                    counts[station.station_id] = 0;
                }
            } catch (err) {
                console.error(`❌ Error fetching suspect count for station ${station.station_id}:`, err);
                counts[station.station_id] = 0;
            }
        }
        
        setStationSuspectCounts(counts);
    };

    const fetchSuspects = async (stationId: number) => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 National suspects - Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/suspects/station/${stationId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 National suspects API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ National suspects API response:', response.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `Failed to fetch suspects (${response.status})`);
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

    const openModal = (stationId: number, stationName: string) => {
        setSelectedStation({id: stationId, name: stationName});
        setIsModalOpen(true);
        fetchSuspects(stationId);
    };

    if (stationsLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted animate-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Loading stations network...</p>
            </div>
        );
    }

    if (error && !myStation) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-rose-400 animate-in">
                <ShieldAlert className="h-12 w-12" />
                <p className="text-lg font-bold uppercase tracking-widest">Station Network Error</p>
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
            {/* DPO Header - Only show when accessed from DPO dashboard */}
            {isFromDPO && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">Stations Suspects</h1>
                        <p className="text-muted mt-1">Department of Police Operations - Station Overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">DPO Access</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Regular National Suspects Header - Only show when NOT accessed from DPO */}
            {!isFromDPO && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">National Suspects</h1>
                        <p className="text-muted mt-1">Cross-jurisdictional suspect tracking and federal watchlists.</p>
                    </div>
                </div>
            )}

            {/* My Station Container */}
            {myStation && (
                <StationContainer
                    station={myStation}
                    isMyStation={true}
                    onViewSuspects={openModal}
                    suspectCount={stationSuspectCounts[myStation.station_id] || 0}
                />
            )}

            {/* Other Stations Section */}
            {otherStations.length > 0 && (
                <>
                    {/* Horizontal divider and section header */}
                    <div className="pt-12">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted mt-6 animate-pulse">
                            View other stations suspects
                        </p>
                    </div>

                    {/* Other Stations Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {otherStations.map((station) => (
                            <StationContainer
                                key={station.station_id}
                                station={station}
                                isMyStation={false}
                                onViewSuspects={openModal}
                                suspectCount={stationSuspectCounts[station.station_id] || 0}
                            />
                        ))}
                    </div>
                </>
            )}

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
                                    <h2 className="text-xl font-bold text-white leading-tight">
                                        {selectedStation?.name || 'Station'} Suspects
                                    </h2>
                                    <p className="text-xs text-muted leading-tight">
                                        Station ID: {selectedStation?.id || 'Unknown'} • Federal watchlist and cross-jurisdictional tracking.
                                    </p>
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
