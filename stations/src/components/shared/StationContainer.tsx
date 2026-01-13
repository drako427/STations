"use client";

import { ShieldAlert, Globe, Scale, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface StationContainerProps {
    station: Station;
    isMyStation?: boolean;
    onViewSuspects: (stationId: number, stationName: string) => void;
    suspectCount?: number;
}

export function StationContainer({ 
    station, 
    isMyStation = false, 
    onViewSuspects,
    suspectCount = 0 
}: StationContainerProps) {
    const getIcon = () => {
        if (isMyStation) return <ShieldAlert className="h-8 w-8 text-primary animate-pulse" />;
        return <Globe className="h-6 w-6 text-primary" />;
    };

    const getBadgeText = () => {
        if (isMyStation) return "Your Station";
        return station.jurisdiction_type || "Local Station";
    };

    const getSectorText = () => {
        if (isMyStation) return "Active Federal Station";
        return station.sector || "Sector Unknown";
    };

    // Compact layout for other stations
    if (!isMyStation) {
        return (
            <div className="glass-card p-4 border-border/50 hover:border-primary/50 transition-all group">
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                                    {getBadgeText()}
                                </span>
                                <div className="h-0.5 w-0.5 rounded-full bg-primary" />
                                <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                                    {getSectorText()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight truncate">
                                {station.station_name}
                            </h3>
                            <p className="text-xs text-muted leading-tight truncate">
                                {station.location || "Location unknown"} • {suspectCount} suspects
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={() => onViewSuspects(station.station_id, station.station_name)}
                        className="w-full px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                    >
                        <Eye className="h-3 w-3" />
                        View Suspects
                    </button>
                </div>
            </div>
        );
    }

    // Full layout for my station
    return (
        <div className="glass-card p-6 border-border/50 hover:border-primary/50 transition-all group border-primary/30 bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-inner">
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {getBadgeText()}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {getSectorText()}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            {station.station_name}
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            Primary coordination center for cross-jurisdictional suspect tracking and federal watchlists.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => onViewSuspects(station.station_id, station.station_name)}
                    className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]"
                >
                    <Eye className="h-4 w-4" />
                    View Suspects
                </button>
            </div>
        </div>
    );
}
