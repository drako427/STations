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
    const [isAllSuspectsModalOpen, setIsAllSuspectsModalOpen] = useState(false);
    const [allSuspects, setAllSuspects] = useState<Suspect[]>([]);
    const [allSuspectsLoading, setAllSuspectsLoading] = useState(false);
    const [suspectList, setSuspectList] = useState<Suspect[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [allSuspectsSearchTerm, setAllSuspectsSearchTerm] = useState("");
    const [stations, setStations] = useState<Station[]>([]);
    const [myStation, setMyStation] = useState<Station | null>(null);
    const [otherStations, setOtherStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<{station_id: number, station_name: string} | null>(null);
    const [stationsLoading, setStationsLoading] = useState(true);
    const [stationSuspectCounts, setStationSuspectCounts] = useState<{[key: number]: number}>({});
    const [stationSuspects, setStationSuspects] = useState<Suspect[]>([]);
    const [stationSuspectsLoading, setStationSuspectsLoading] = useState(false);
    const [stationModalOpen, setStationModalOpen] = useState(false);
    const [stationSearchQuery, setStationSearchQuery] = useState<string>('');

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
                let userStationId;
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    userStationId = tokenPayload.station_id; // Use station_id not stationId
                    console.log('🔍 User Station ID from token:', userStationId);
                    console.log('🔍 Full token payload:', tokenPayload);
                } catch (tokenError) {
                    console.error('❌ Token parsing error:', tokenError);
                    userStationId = null;
                }

                // Fetch all stations
                const response = await fetch('/api/stations', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stations');
                }

                const allStations: Station[] = await response.json();
                console.log('📊 All stations fetched:', allStations);
                
                // Filter out any entries that don't look like actual stations
                // Remove entries with "DPO" in the name or other non-station patterns
                const actualStations = allStations.filter((station: any) => {
                    const stationName = (station.station_name || '').toLowerCase();
                    const isDPO = stationName.includes('dpo') || stationName.includes('district police officer');
                    const isValidStation = station.station_id && station.station_name && station.station_code;
                    
                    console.log(`🔍 Checking station "${station.station_name}": isDPO=${isDPO}, isValid=${isValidStation}`);
                    
                    return isValidStation && !isDPO;
                });
                
                console.log('✅ Filtered actual stations:', actualStations);
                
                // Separate my station from other stations
                const myStationData = userStationId ? actualStations.find(s => s.station_id === userStationId) : null;
                const otherStationsData = userStationId ? actualStations.filter(s => s.station_id !== userStationId) : actualStations;
                
                console.log('🏢 My station found:', myStationData);
                console.log('🌍 Other stations found:', otherStationsData);
                
                setMyStation(myStationData || null);
                setOtherStations(otherStationsData);
                setStations(actualStations);

                // Fetch suspect counts for each station
                await fetchSuspectCounts(actualStations, token);

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
        
        console.log('🔍 Starting fetchSuspectCounts for', stationsList.length, 'stations');
        console.log('🔍 Token exists:', !!token);
        
        const counts: {[key: number]: number} = {};
        
        // Add delay between requests to avoid overwhelming the server
        for (let i = 0; i < stationsList.length; i++) {
            const station = stationsList[i];
            
            try {
                console.log(`🔍 Fetching suspects for station ${station.station_id} (${station.station_name})`);
                
                const response = await fetch(`/api/suspects/network/station/${station.station_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log(`📡 Response status for station ${station.station_id}:`, response.status);
                
                if (response.ok) {
                    const responseText = await response.text();
                    console.log(`📡 Raw response text for station ${station.station_id}:`, responseText);
                    
                    let suspects;
                    try {
                        suspects = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error(`❌ JSON parse error for station ${station.station_id}:`, parseError);
                        console.error(`❌ Raw text that failed to parse:`, responseText);
                        counts[station.station_id] = 0;
                        continue;
                    }
                    
                    counts[station.station_id] = suspects.length;
                    console.log(`✅ Station ${station.station_id} has ${suspects.length} suspects`);
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Error fetching suspect count for station ${station.station_id}:`, response.status, errorText);
                    counts[station.station_id] = 0;
                }
            } catch (err) {
                console.error(`❌ Network error fetching suspect count for station ${station.station_id}:`, err);
                counts[station.station_id] = 0;
            }
            
            // Add small delay between requests
            if (i < stationsList.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log('🔍 Final counts:', counts);
        setStationSuspectCounts(counts);
    };

    // Fetch suspects from a specific station
    const fetchStationSuspects = async (stationId: number) => {
        console.log(`🔍 Fetching suspects for station_id: ${stationId}`);
        setStationSuspectsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No token found for fetchStationSuspects');
                return;
            }

            const response = await fetch(`/api/suspects/network/station/${stationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(`📡 Station suspects response status: ${response.status}`);
            console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const responseText = await response.text();
                console.log(`📡 Raw response text for station ${stationId}:`, responseText);
                
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error(`❌ JSON parse error for station ${stationId}:`, parseError);
                    console.error(`❌ Raw text that failed to parse:`, responseText);
                    setStationSuspects([]);
                    return;
                }
                
                console.log(`✅ Received ${data.length} suspects for station ${stationId}:`, data);
                
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
                
                setStationSuspects(transformedData);
            } else {
                const errorText = await response.text();
                console.error(`❌ Failed to fetch station suspects:`, {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                setStationSuspects([]);
            }
        } catch (error) {
            console.error('❌ Network error fetching station suspects:', error);
            setStationSuspects([]);
        } finally {
            setStationSuspectsLoading(false);
        }
    };

    // Fetch suspects from current station only
    const fetchAllSuspects = async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        setAllSuspectsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setAllSuspectsLoading(false);
                return;
            }

            // Decode token to get user's station_id
            const response = await fetch('/api/suspects', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch station suspects');
            }

            const data = await response.json();
            const suspectRows = Array.isArray(data) ? data : (Array.isArray(data?.suspects) ? data.suspects : []);
            
            // Transform database data to match component expectations
            const transformedData = suspectRows.map((suspect: any) => ({
                ...suspect,
                id: suspect.suspect_code || `S-00${suspect.suspect_id}`,
                name: suspect.full_name || suspect.name || 'Unknown',
                status: suspect.status || "Active Investigation",
                risk: suspect.risk_level ? suspect.risk_level.charAt(0).toUpperCase() + suspect.risk_level.slice(1) : 'Medium',
                lastSeen: new Date(suspect.created_at || suspect.created_at).toLocaleDateString(),
                location: suspect.location || suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.full_name || suspect.name || 'Unknown'}`
            }));

            setAllSuspects(transformedData);
        } catch (err: any) {
            console.error('Error fetching station suspects:', err);
            setError(err.message || 'Failed to load station suspects');
        } finally {
            setAllSuspectsLoading(false);
        }
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

            const response = await fetch(`/api/suspects/network/station/${stationId}`, {
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

    // Fetch suspects from My Suspects page (user's own station)
    const fetchMyStationSuspects = async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 My Station Suspects - Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }

            // Use the same API as My Suspects page
            const response = await fetch('/api/suspects', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 My Station Suspects API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ My Station Suspects API response:', response.status, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `Failed to fetch my station suspects (${response.status})`);
            }

            const data = await response.json();
            const suspects = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.suspects) ? data.suspects : []));

            if (!Array.isArray(data) && !Array.isArray(data?.data) && !Array.isArray(data?.suspects)) {
                console.error('Unexpected /api/suspects response shape:', data);
            }
            
            // Transform database data to match component expectations (same as My Suspects page)
            const transformedData = suspects.map((suspect: any) => ({
                ...suspect,
                id: suspect.suspect_id || `S-00${suspect.suspect_id}`,
                name: suspect.name || suspect.full_name || 'Unknown',
                status: suspect.status || "Active Investigation",
                risk: suspect.risk_level ? suspect.risk_level.charAt(0).toUpperCase() + suspect.risk_level.slice(1) : 'Medium',
                lastSeen: new Date(suspect.created_at || suspect.created_at).toLocaleDateString(),
                location: suspect.location || suspect.physical_description?.split(',')[1]?.trim() || "Unknown",
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.name || suspect.full_name || 'Unknown'}`
            }));

            setSuspectList(transformedData);
        } catch (err: any) {
            console.error('Error fetching my station suspects:', err);
            setError(err.message || 'Failed to load my station suspects');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (stationId: number, stationName: string) => {
        setSelectedStation({station_id: stationId, station_name: stationName});
        setIsModalOpen(true);
        fetchSuspects(stationId);
    };

    const handleViewMyStationSuspects = () => {
        setSelectedStation({station_id: myStation?.station_id || 0, station_name: myStation?.station_name || 'My Station'});
        setIsModalOpen(true);
        fetchMyStationSuspects(); // Use My Suspects API
    };

    const handleViewStationSuspects = (stationId: number, stationName: string) => {
        console.log('🖱️ Clicked to view station suspects:', { stationId, stationName });
        setSelectedStation({ station_id: stationId, station_name: stationName });
        setStationModalOpen(true);
        setStationSuspects([]); // Clear previous suspects
        setStationSearchQuery(''); // Reset search query
        fetchStationSuspects(stationId);
    };

    // Filter station suspects based on search query
    const filteredStationSuspects = stationSuspects.filter(suspect => 
        stationSearchQuery === '' || 
        suspect.full_name.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
        suspect.crime_committed.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
        suspect.suspect_code?.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
        suspect.physical_description.toLowerCase().includes(stationSearchQuery.toLowerCase())
    );

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
                    onViewSuspects={handleViewMyStationSuspects}
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
                                onViewSuspects={handleViewStationSuspects}
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
                                        {selectedStation?.station_name || 'Station'} Suspects
                                    </h2>
                                    <p className="text-xs text-muted leading-tight">
                                        Station ID: {selectedStation?.station_id || 'Unknown'} • Federal watchlist and cross-jurisdictional tracking.
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

            {/* All Suspects Modal */}
            {isAllSuspectsModalOpen && (
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
                                        {myStation?.station_name}
                                    </h2>
                                    <p className="text-xs text-muted leading-tight">
                                        All registered suspects from {myStation?.station_name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAllSuspectsModalOpen(false)}
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
                                        value={allSuspectsSearchTerm}
                                        onChange={(e) => setAllSuspectsSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Loading State */}
                            {allSuspectsLoading && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-sm font-medium animate-pulse">Loading {myStation?.station_name} suspects...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !allSuspectsLoading && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-rose-400">
                                    <ShieldAlert className="h-12 w-12" />
                                    <p className="text-lg font-bold uppercase tracking-widest">Connection Failed</p>
                                    <p className="text-sm text-muted max-w-md text-center">{error}</p>
                                    <button
                                        onClick={fetchAllSuspects}
                                        className="mt-4 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all"
                                    >
                                        RETRY CONNECTION
                                    </button>
                                </div>
                            )}

                            {/* All Suspects Table */}
                            {!allSuspectsLoading && !error && (
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
                                                {allSuspects.filter(s => s.name?.toLowerCase().includes(allSuspectsSearchTerm.toLowerCase())).map((suspect) => (
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

            {/* Station Suspects Modal */}
            {stationModalOpen && selectedStation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedStation.station_name} Suspects</h2>
                                    <p className="text-sm text-muted">Suspects registered at this station</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStationModalOpen(false)}
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                                    <input
                                        type="text"
                                        placeholder={`Search suspects in ${selectedStation.station_name}...`}
                                        value={stationSearchQuery}
                                        onChange={(e) => setStationSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {stationSearchQuery && (
                                        <button
                                            onClick={() => setStationSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-surface/50 transition-colors"
                                        >
                                            <X className="h-4 w-4 text-muted" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {stationSuspectsLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                        <p className="text-sm text-muted">Loading {selectedStation.station_name} suspects...</p>
                                    </div>
                                </div>
                            ) : filteredStationSuspects.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <ShieldAlert className="h-12 w-12 text-muted mx-auto mb-4" />
                                        <p className="text-sm text-muted">
                                            {stationSearchQuery 
                                                ? `No suspects found matching "${stationSearchQuery}" in ${selectedStation.station_name}`
                                                : `No suspects found for ${selectedStation.station_name}`
                                            }
                                        </p>
                                        <p className="text-xs text-muted mt-2">
                                            {stationSearchQuery 
                                                ? `Try different search terms or clear the search`
                                                : `Station ID: ${selectedStation.station_id}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 border-b border-border">
                                        <p className="text-sm text-white">
                                            Showing <span className="font-bold text-primary">{filteredStationSuspects.length}</span> 
                                            {stationSearchQuery ? ` matching "${stationSearchQuery}"` : ''} 
                                            {filteredStationSuspects.length !== stationSuspects.length ? ` of ${stationSuspects.length}` : ''} 
                                            suspects for {selectedStation.station_name}
                                        </p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredStationSuspects.map((suspect, index) => (
                                                <div key={suspect.suspect_id || `suspect-${index}`} className="glass-card p-4 hover:border-primary/50 transition-all group">
                                                    {/* Suspect Image */}
                                                    <div className="aspect-video bg-surface/50 rounded-lg mb-4 overflow-hidden">
                                                        <img 
                                                            src={suspect.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.full_name || 'Unknown'}`}
                                                            alt={suspect.full_name || 'Unknown'}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            onError={(e) => {
                                                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${suspect.full_name || 'Unknown'}`;
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Suspect Details */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-white text-sm line-clamp-2">{suspect.full_name || 'Unknown'}</h3>
                                                                <p className="text-xs text-muted mt-1">{suspect.suspect_code || ''}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {getStatusIcon(suspect.status || '')}
                                                                <span className="text-xs text-muted">{suspect.status || 'Unknown'}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-muted text-xs line-clamp-2">{suspect.crime_committed || 'No crime information'}</p>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(suspect.risk_level || 'Medium')}`}>
                                                                {suspect.risk_level || 'Medium'}
                                                            </span>
                                                            <span className="text-xs text-muted">{new Date(suspect.created_at).toLocaleDateString()}</span>
                                                        </div>

                                                        {/* Read-only Badge */}
                                                        <div className="flex items-center justify-center pt-2 border-t border-border">
                                                            <span className="text-xs text-muted bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                                                                🔒 Read-only view
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
