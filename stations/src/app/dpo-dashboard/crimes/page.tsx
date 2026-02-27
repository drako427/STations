"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scale, Search, Filter, Calendar, MapPin, AlertTriangle, Users, ShieldCheck, Eye, MoreVertical, ChevronDown, Clock, Activity, TrendingUp, Badge, FileText, X, UserCheck, Target, Zap } from "lucide-react";

interface Crime {
    id: string;
    case_number: string;
    title: string;
    type: 'violent' | 'property' | 'drug' | 'cyber' | 'white-collar' | 'organized' | 'traffic' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'solved' | 'closed' | 'cold';
    station: string;
    station_code: string;
    location: string;
    date_occurred: string;
    date_reported: string;
    assigned_officer: string;
    officer_badge: string;
    suspects_count: number;
    arrests_count: number;
    victims_count: number;
    evidence_count: number;
    clearance_rate: number;
    estimated_value: number;
    description: string;
    last_updated: string;
    priority: number;
    jurisdiction: string;
}

export default function DPOCrimesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "violent" | "property" | "drug" | "cyber" | "white-collar" | "organized" | "traffic" | "other">("all");
    const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high" | "critical">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | "investigating" | "solved" | "closed" | "cold">("all");
    const [sortBy, setSortBy] = useState<"date" | "severity" | "priority" | "case">("severity");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

    // Mock crimes data
    const [crimes] = useState<Crime[]>([
        {
            id: "CRM-2024-001",
            case_number: "CASE-2024-001",
            title: "Armed Robbery at Central Bank",
            type: "violent",
            severity: "critical",
            status: "investigating",
            station: "DPO Headquarters",
            station_code: "STN-001",
            location: "Banjul, Central Bank Branch",
            date_occurred: "2024-01-15",
            date_reported: "2024-01-15",
            assigned_officer: "James Wilson",
            officer_badge: "B-2024-001",
            suspects_count: 3,
            arrests_count: 1,
            victims_count: 8,
            evidence_count: 12,
            clearance_rate: 33.3,
            estimated_value: 250000,
            description: "Multiple armed suspects robbed the central bank branch during business hours.",
            last_updated: "2 hours ago",
            priority: 1,
            jurisdiction: "National"
        },
        {
            id: "CRM-2024-002",
            case_number: "CASE-2024-002",
            title: "Cybercrime - Government Database Breach",
            type: "cyber",
            severity: "high",
            status: "open",
            station: "Banjul Station",
            station_code: "STN-003",
            location: "Online - Government Systems",
            date_occurred: "2024-01-18",
            date_reported: "2024-01-19",
            assigned_officer: "Michael Brown",
            officer_badge: "B-2024-003",
            suspects_count: 2,
            arrests_count: 0,
            victims_count: 50000,
            evidence_count: 45,
            clearance_rate: 0,
            estimated_value: 1000000,
            description: "Unauthorized access to government citizen database containing sensitive personal information.",
            last_updated: "30 minutes ago",
            priority: 2,
            jurisdiction: "National"
        },
        {
            id: "CRM-2024-003",
            case_number: "CASE-2024-003",
            title: "Drug Trafficking Operation",
            type: "drug",
            severity: "high",
            status: "solved",
            station: "Wellingara Station",
            station_code: "STN-002",
            location: "Wellingara Market Area",
            date_occurred: "2024-01-10",
            date_reported: "2024-01-12",
            assigned_officer: "Sarah Johnson",
            officer_badge: "B-2024-002",
            suspects_count: 5,
            arrests_count: 5,
            victims_count: 0,
            evidence_count: 28,
            clearance_rate: 100,
            estimated_value: 750000,
            description: "Large-scale drug trafficking operation dismantled with multiple arrests and seizure of narcotics.",
            last_updated: "1 day ago",
            priority: 3,
            jurisdiction: "Regional"
        },
        {
            id: "CRM-2024-004",
            case_number: "CASE-2024-004",
            title: "Vehicle Theft Ring",
            type: "property",
            severity: "medium",
            status: "investigating",
            station: "West Precinct",
            station_code: "STN-004",
            location: "Multiple Locations",
            date_occurred: "2024-01-20",
            date_reported: "2024-01-21",
            assigned_officer: "Amanda Davis",
            officer_badge: "B-2024-004",
            suspects_count: 4,
            arrests_count: 0,
            victims_count: 12,
            evidence_count: 15,
            clearance_rate: 0,
            estimated_value: 180000,
            description: "Organized vehicle theft ring operating across multiple jurisdictions.",
            last_updated: "4 hours ago",
            priority: 4,
            jurisdiction: "Multi-jurisdictional"
        },
        {
            id: "CRM-2024-005",
            case_number: "CASE-2024-005",
            title: "Corporate Fraud Investigation",
            type: "white-collar",
            severity: "high",
            status: "open",
            station: "DPO Headquarters",
            station_code: "STN-001",
            location: "Banjul Business District",
            date_occurred: "2023-12-01",
            date_reported: "2024-01-05",
            assigned_officer: "James Wilson",
            officer_badge: "B-2024-001",
            suspects_count: 3,
            arrests_count: 0,
            victims_count: 150,
            evidence_count: 67,
            clearance_rate: 0,
            estimated_value: 2500000,
            description: "Complex corporate fraud involving financial misrepresentation and embezzlement.",
            last_updated: "6 hours ago",
            priority: 2,
            jurisdiction: "National"
        },
        {
            id: "CRM-2024-006",
            case_number: "CASE-2024-006",
            title: "Traffic Accident - Hit and Run",
            type: "traffic",
            severity: "low",
            status: "closed",
            station: "Wellingara Station",
            station_code: "STN-002",
            location: "Wellingara Main Road",
            date_occurred: "2024-01-22",
            date_reported: "2024-01-22",
            assigned_officer: "Lisa Thompson",
            officer_badge: "B-2024-006",
            suspects_count: 1,
            arrests_count: 1,
            victims_count: 2,
            evidence_count: 8,
            clearance_rate: 100,
            estimated_value: 15000,
            description: "Hit and run traffic accident with minor injuries.",
            last_updated: "2 days ago",
            priority: 6,
            jurisdiction: "Local"
        }
    ]);

    const stations = [...new Set(crimes.map(c => c.station))];
    const jurisdictions = [...new Set(crimes.map(c => c.jurisdiction))];

    const filteredCrimes = crimes.filter(crime => {
        const matchesSearch = crime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            crime.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            crime.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            crime.assigned_officer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || crime.type === typeFilter;
        const matchesSeverity = severityFilter === "all" || crime.severity === severityFilter;
        const matchesStatus = statusFilter === "all" || crime.status === statusFilter;
        return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });

    const sortedCrimes = [...filteredCrimes].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(b.date_occurred).getTime() - new Date(a.date_occurred).getTime();
            case "severity":
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            case "priority":
                return a.priority - b.priority;
            case "case":
                return a.case_number.localeCompare(b.case_number);
            default:
                return 0;
        }
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case "violent": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case "property": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "drug": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "cyber": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "white-collar": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "organized": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "traffic": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "other": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "low": return "bg-green-500/10 text-green-400 border-green-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "investigating": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "solved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            case "cold": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "violent": return AlertTriangle;
            case "property": return Target;
            case "drug": return Zap;
            case "cyber": return ShieldCheck;
            case "white-collar": return Scale;
            case "organized": return Users;
            case "traffic": return Activity;
            case "other": return FileText;
            default: return FileText;
        }
    };

    const getPriorityBadge = (priority: number) => {
        if (priority <= 2) return { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "High Priority" };
        if (priority <= 4) return { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Medium Priority" };
        return { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Low Priority" };
    };

    const handleViewCrime = (crime: Crime) => {
        setSelectedCrime(crime);
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">National Crime Database</h1>
                    <p className="text-muted mt-1">Comprehensive crime tracking and management system</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-rose-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-rose-400 tracking-widest uppercase">DPO Crimes</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 border-l-4 border-l-rose-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
                            <Scale className="h-6 w-6 text-rose-400" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Cases</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{crimes.length}</h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-orange-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-orange-400/10 border border-orange-400/20">
                            <AlertTriangle className="h-6 w-6 text-orange-400" />
                        </div>
                        <Target className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Critical Cases</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {crimes.filter(c => c.severity === 'critical').length}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-green-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                            <Users className="h-6 w-6 text-green-400" />
                        </div>
                        <UserCheck className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Solved Cases</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {crimes.filter(c => c.status === 'solved').length}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-purple-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-purple-400/10 border border-purple-400/20">
                            <ShieldCheck className="h-6 w-6 text-purple-400" />
                        </div>
                        <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Clearance Rate</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {Math.round(crimes.reduce((sum, c) => sum + c.clearance_rate, 0) / crimes.length)}%
                        </h3>
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
                            placeholder="Search crimes by title, case number, location, or officer..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-white/10 border border-border rounded-lg text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showFilters && (
                    <div className="glass-card p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Crime Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                                >
                                    <option value="all">All Types</option>
                                    <option value="violent">Violent</option>
                                    <option value="property">Property</option>
                                    <option value="drug">Drug</option>
                                    <option value="cyber">Cyber</option>
                                    <option value="white-collar">White Collar</option>
                                    <option value="organized">Organized</option>
                                    <option value="traffic">Traffic</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Severity</label>
                                <select
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                                >
                                    <option value="all">All Severities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="solved">Solved</option>
                                    <option value="closed">Closed</option>
                                    <option value="cold">Cold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                                >
                                    <option value="severity">Severity</option>
                                    <option value="priority">Priority</option>
                                    <option value="date">Date</option>
                                    <option value="case">Case Number</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Crimes Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {sortedCrimes.map((crime) => {
                    const TypeIcon = getTypeIcon(crime.type);
                    const priorityBadge = getPriorityBadge(crime.priority);
                    return (
                        <div key={crime.id} className="glass-card p-6 hover:border-rose-400/50 transition-all group">
                            {/* Crime Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-rose-400/10 flex items-center justify-center group-hover:bg-rose-400/20 transition-colors">
                                        <TypeIcon className="h-5 w-5 text-rose-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white line-clamp-2">{crime.title}</h3>
                                        <p className="text-xs text-muted">{crime.case_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSeverityColor(crime.severity)}`}>
                                        {crime.severity}
                                    </span>
                                </div>
                            </div>

                            {/* Crime Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Type:</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getTypeColor(crime.type)}`}>
                                        {crime.type}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Status:</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(crime.status)}`}>
                                        {crime.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Station:</span>
                                    <span className="text-white">{crime.station}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Location:</span>
                                    <span className="text-white line-clamp-1">{crime.location}</span>
                                </div>
                            </div>

                            {/* Priority Badge */}
                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityBadge.color}`}>
                                    {priorityBadge.label}
                                </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{crime.suspects_count}</div>
                                    <div className="text-xs text-muted">Suspects</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{crime.arrests_count}</div>
                                    <div className="text-xs text-muted">Arrests</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{crime.clearance_rate}%</div>
                                    <div className="text-xs text-muted">Rate</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-muted line-clamp-3 mb-4">{crime.description}</p>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Clock className="h-3 w-3" />
                                    <span>{crime.last_updated}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewCrime(crime)}
                                        className="p-2 text-muted hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-lg"
                                        title="View crime details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-muted hover:text-white transition-colors hover:bg-white/10 rounded-lg">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Crime Detail Modal */}
            {selectedCrime && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-4xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                    {(() => {
                                        const TypeIcon = getTypeIcon(selectedCrime.type);
                                        return <TypeIcon className="h-6 w-6 text-rose-400" />;
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedCrime.title}</h2>
                                    <p className="text-sm text-muted">{selectedCrime.case_number}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCrime(null)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Crime Content */}
                        <div className="space-y-6">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Type</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(selectedCrime.type)}`}>
                                        {selectedCrime.type}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Severity</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(selectedCrime.severity)}`}>
                                        {selectedCrime.severity}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Status</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedCrime.status)}`}>
                                        {selectedCrime.status}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Priority</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityBadge(selectedCrime.priority).color}`}>
                                        Priority {selectedCrime.priority}
                                    </div>
                                </div>
                            </div>

                            {/* Case Overview */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Case Overview</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedCrime.suspects_count}</div>
                                        <div className="text-sm text-muted">Suspects</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedCrime.arrests_count}</div>
                                        <div className="text-sm text-muted">Arrests</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedCrime.victims_count}</div>
                                        <div className="text-sm text-muted">Victims</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedCrime.clearance_rate}%</div>
                                        <div className="text-sm text-muted">Clearance Rate</div>
                                    </div>
                                </div>
                            </div>

                            {/* Case Details */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Case Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">{selectedCrime.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">Occurred: {new Date(selectedCrime.date_occurred).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">Reported: {new Date(selectedCrime.date_reported).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">{selectedCrime.assigned_officer} ({selectedCrime.officer_badge})</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">{selectedCrime.station}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Target className="h-4 w-4 text-muted" />
                                            <span className="text-sm text-white">{selectedCrime.jurisdiction} Jurisdiction</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Case Description</h3>
                                <p className="text-sm text-muted leading-relaxed">{selectedCrime.description}</p>
                            </div>

                            {/* Evidence & Value */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Evidence</h3>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{selectedCrime.evidence_count}</div>
                                        <div className="text-sm text-muted">Evidence Items</div>
                                    </div>
                                </div>
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Estimated Value</h3>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-3xl font-bold text-white">${selectedCrime.estimated_value.toLocaleString()}</div>
                                        <div className="text-sm text-muted">Total Value</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-all">
                                    Full Case File
                                </button>
                                <button className="flex-1 px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-all">
                                    Update Status
                                </button>
                                <button
                                    onClick={() => setSelectedCrime(null)}
                                    className="px-6 py-3 bg-white/10 border border-border text-white rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
