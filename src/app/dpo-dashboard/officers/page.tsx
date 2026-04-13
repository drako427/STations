"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Search, Filter, MapPin, ShieldCheck, Badge, Phone, Mail, Calendar, Award, Users, Eye, MoreVertical, ChevronDown, Building2, Star, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";

interface Officer {
    id: string;
    name: string;
    badge_number: string;
    rank: string;
    station: string;
    station_code: string;
    department: string;
    status: 'active' | 'on-duty' | 'off-duty' | 'suspended' | 'leave';
    contact_phone: string;
    contact_email: string;
    join_date: string;
    years_of_service: number;
    cases_assigned: number;
    cases_solved: number;
    arrest_rate: number;
    specialization: string[];
    certifications: string[];
    last_active: string;
    performance_rating: number;
    location?: string;
    current_assignment?: string;
}

export default function DPOOfficersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [rankFilter, setRankFilter] = useState<"all" | "officer" | "sergeant" | "lieutenant" | "captain" | "chief">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "on-duty" | "off-duty" | "suspended" | "leave">("all");
    const [stationFilter, setStationFilter] = useState<"all" | string>("all");
    const [sortBy, setSortBy] = useState<"name" | "badge" | "performance" | "cases">("performance");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

    // Mock officers data
    const [officers] = useState<Officer[]>([
        {
            id: "OFC-001",
            name: "James Wilson",
            badge_number: "B-2024-001",
            rank: "sergeant",
            station: "DPO Headquarters",
            station_code: "STN-001",
            department: "Investigations",
            status: "active",
            contact_phone: "+220 123-4567",
            contact_email: "j.wilson@stations.gov",
            join_date: "2018-03-15",
            years_of_service: 6,
            cases_assigned: 247,
            cases_solved: 189,
            arrest_rate: 76.5,
            specialization: ["Homicide", "Narcotics", "Forensics"],
            certifications: ["Advanced Firearms", "Crisis Intervention", "Detective Training"],
            last_active: "2 hours ago",
            performance_rating: 4.8,
            location: "Headquarters Building A",
            current_assignment: "Major Case Unit"
        },
        {
            id: "OFC-002",
            name: "Sarah Johnson",
            badge_number: "B-2024-002",
            rank: "lieutenant",
            station: "Wellingara Station",
            station_code: "STN-002",
            department: "Patrol",
            status: "on-duty",
            contact_phone: "+220 234-5678",
            contact_email: "s.johnson@stations.gov",
            join_date: "2016-07-22",
            years_of_service: 8,
            cases_assigned: 189,
            cases_solved: 156,
            arrest_rate: 82.5,
            specialization: ["Community Policing", "Traffic Enforcement", "Crisis Response"],
            certifications: ["Advanced Driving", "First Aid", "Community Relations"],
            last_active: "30 minutes ago",
            performance_rating: 4.9,
            location: "Wellingara Patrol Zone 3",
            current_assignment: "Patrol Supervisor"
        },
        {
            id: "OFC-003",
            name: "Michael Brown",
            badge_number: "B-2024-003",
            rank: "officer",
            station: "Banjul Station",
            station_code: "STN-003",
            department: "Investigations",
            status: "active",
            contact_phone: "+220 345-6789",
            contact_email: "m.brown@stations.gov",
            join_date: "2020-11-10",
            years_of_service: 4,
            cases_assigned: 134,
            cases_solved: 98,
            arrest_rate: 73.1,
            specialization: ["Cybercrime", "Financial Crimes", "Digital Forensics"],
            certifications: ["Cyber Investigation", "Digital Evidence Collection", "Data Analysis"],
            last_active: "1 hour ago",
            performance_rating: 4.6,
            location: "Banjul Tech Crimes Unit",
            current_assignment: "Cybercrime Investigation"
        },
        {
            id: "OFC-004",
            name: "Amanda Davis",
            badge_number: "B-2024-004",
            rank: "captain",
            station: "West Precinct",
            station_code: "STN-004",
            department: "Operations",
            status: "active",
            contact_phone: "+220 456-7890",
            contact_email: "a.davis@stations.gov",
            join_date: "2014-05-18",
            years_of_service: 10,
            cases_assigned: 412,
            cases_solved: 334,
            arrest_rate: 81.1,
            specialization: ["Operations Management", "Strategic Planning", "Crisis Management"],
            certifications: ["Leadership Training", "Emergency Management", "Advanced Tactics"],
            last_active: "4 hours ago",
            performance_rating: 4.9,
            location: "West Precinct Command Center",
            current_assignment: "Precinct Commander"
        },
        {
            id: "OFC-005",
            name: "Robert Martinez",
            badge_number: "B-2024-005",
            rank: "sergeant",
            station: "DPO Headquarters",
            station_code: "STN-001",
            department: "Special Operations",
            status: "off-duty",
            contact_phone: "+220 567-8901",
            contact_email: "r.martinez@stations.gov",
            join_date: "2019-09-12",
            years_of_service: 5,
            cases_assigned: 178,
            cases_solved: 145,
            arrest_rate: 81.5,
            specialization: ["SWAT", "Hostage Negotiation", "Tactical Operations"],
            certifications: ["SWAT Training", "Negotiation Tactics", "Advanced Firearms"],
            last_active: "2 days ago",
            performance_rating: 4.7,
            location: "Off Duty",
            current_assignment: "Special Operations Unit"
        },
        {
            id: "OFC-006",
            name: "Lisa Thompson",
            badge_number: "B-2024-006",
            rank: "officer",
            station: "Wellingara Station",
            station_code: "STN-002",
            department: "Community Services",
            status: "leave",
            contact_phone: "+220 678-9012",
            contact_email: "l.thompson@stations.gov",
            join_date: "2021-02-28",
            years_of_service: 3,
            cases_assigned: 89,
            cases_solved: 67,
            arrest_rate: 75.3,
            specialization: ["Community Outreach", "Youth Programs", "Victim Support"],
            certifications: ["Community Policing", "Counseling Skills", "Youth Intervention"],
            last_active: "1 week ago",
            performance_rating: 4.5,
            location: "On Leave",
            current_assignment: "Community Services"
        }
    ]);

    const stations = [...new Set(officers.map(o => o.station))];

    const filteredOfficers = officers.filter(officer => {
        const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            officer.badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            officer.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            officer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRank = rankFilter === "all" || officer.rank === rankFilter;
        const matchesStatus = statusFilter === "all" || officer.status === statusFilter;
        const matchesStation = stationFilter === "all" || officer.station === stationFilter;
        return matchesSearch && matchesRank && matchesStatus && matchesStation;
    });

    const sortedOfficers = [...filteredOfficers].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "badge":
                return a.badge_number.localeCompare(b.badge_number);
            case "performance":
                return b.performance_rating - a.performance_rating;
            case "cases":
                return b.cases_solved - a.cases_solved;
            default:
                return 0;
        }
    });

    const getRankColor = (rank: string) => {
        switch (rank) {
            case "chief": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "captain": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "lieutenant": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "sergeant": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "officer": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "on-duty": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "off-duty": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "suspended": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case "leave": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return CheckCircle;
            case "on-duty": return ShieldCheck;
            case "off-duty": return Clock;
            case "suspended": return AlertTriangle;
            case "leave": return Calendar;
            default: return Users;
        }
    };

    const getPerformanceStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400/50" />);
            } else {
                stars.push(<Star key={i} className="h-4 w-4 text-gray-600" />);
            }
        }
        return stars;
    };

    const handleViewOfficer = (officer: Officer) => {
        setSelectedOfficer(officer);
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">National Officers</h1>
                    <p className="text-muted mt-1">Comprehensive officer management and performance tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">DPO Officers</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 border-l-4 border-l-purple-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-purple-400/10 border border-purple-400/20">
                            <Users className="h-6 w-6 text-purple-400" />
                        </div>
                        <UserCheck className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Officers</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{officers.length}</h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-green-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                            <ShieldCheck className="h-6 w-6 text-green-400" />
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Active Officers</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {officers.filter(o => o.status === 'active' || o.status === 'on-duty').length}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-amber-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                            <Award className="h-6 w-6 text-amber-400" />
                        </div>
                        <Star className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Avg Performance</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {(officers.reduce((sum, o) => sum + o.performance_rating, 0) / officers.length).toFixed(1)}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-blue-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
                            <Building2 className="h-6 w-6 text-blue-400" />
                        </div>
                        <MapPin className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Stations</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{stations.length}</h3>
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
                            placeholder="Search officers by name, badge, station, or specialization..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                                <label className="block text-sm font-medium text-white mb-2">Rank</label>
                                <select
                                    value={rankFilter}
                                    onChange={(e) => setRankFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                                >
                                    <option value="all">All Ranks</option>
                                    <option value="chief">Chief</option>
                                    <option value="captain">Captain</option>
                                    <option value="lieutenant">Lieutenant</option>
                                    <option value="sergeant">Sergeant</option>
                                    <option value="officer">Officer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="on-duty">On Duty</option>
                                    <option value="off-duty">Off Duty</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="leave">On Leave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Station</label>
                                <select
                                    value={stationFilter}
                                    onChange={(e) => setStationFilter(e.target.value)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                                >
                                    <option value="all">All Stations</option>
                                    {stations.map(station => (
                                        <option key={station} value={station}>{station}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                                >
                                    <option value="performance">Performance Rating</option>
                                    <option value="name">Name</option>
                                    <option value="badge">Badge Number</option>
                                    <option value="cases">Cases Solved</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Officers Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {sortedOfficers.map((officer) => {
                    const StatusIcon = getStatusIcon(officer.status);
                    return (
                        <div key={officer.id} className="glass-card p-6 hover:border-purple-400/50 transition-all group">
                            {/* Officer Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-purple-400/10 flex items-center justify-center group-hover:bg-purple-400/20 transition-colors">
                                        <UserCheck className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white line-clamp-1">{officer.name}</h3>
                                        <p className="text-xs text-muted">{officer.badge_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRankColor(officer.rank)}`}>
                                        {officer.rank}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(officer.status)}`}>
                                        {officer.status}
                                    </span>
                                </div>
                            </div>

                            {/* Officer Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Station:</span>
                                    <span className="text-white">{officer.station}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Department:</span>
                                    <span className="text-white">{officer.department}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Service:</span>
                                    <span className="text-white">{officer.years_of_service} years</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Last Active:</span>
                                    <span className="text-white">{officer.last_active}</span>
                                </div>
                            </div>

                            {/* Performance Rating */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted">Performance</span>
                                    <span className="text-xs text-white font-bold">{officer.performance_rating}/5.0</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getPerformanceStars(officer.performance_rating)}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{officer.cases_assigned}</div>
                                    <div className="text-xs text-muted">Cases</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{officer.cases_solved}</div>
                                    <div className="text-xs text-muted">Solved</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="text-sm font-bold text-white">{officer.arrest_rate}%</div>
                                    <div className="text-xs text-muted">Rate</div>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="mb-4">
                                <div className="text-xs text-muted mb-2">Specializations</div>
                                <div className="flex flex-wrap gap-1">
                                    {officer.specialization.slice(0, 2).map((spec, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded border border-purple-500/20">
                                            {spec}
                                        </span>
                                    ))}
                                    {officer.specialization.length > 2 && (
                                        <span className="px-2 py-0.5 bg-white/10 text-white text-[10px] rounded border border-white/20">
                                            +{officer.specialization.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <StatusIcon className="h-3 w-3" />
                                    <span>{officer.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewOfficer(officer)}
                                        className="p-2 text-muted hover:text-purple-400 transition-colors hover:bg-purple-400/10 rounded-lg"
                                        title="View officer details"
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

            {/* Officer Detail Modal */}
            {selectedOfficer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-4xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <UserCheck className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedOfficer.name}</h2>
                                    <p className="text-sm text-muted">{selectedOfficer.badge_number}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOfficer(null)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Officer Content */}
                        <div className="space-y-6">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Rank</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getRankColor(selectedOfficer.rank)}`}>
                                        {selectedOfficer.rank}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Status</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedOfficer.status)}`}>
                                        {selectedOfficer.status}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Station</div>
                                    <div className="text-sm text-white">{selectedOfficer.station}</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Department</div>
                                    <div className="text-sm text-white">{selectedOfficer.department}</div>
                                </div>
                            </div>

                            {/* Performance Overview */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Performance Overview</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedOfficer.performance_rating}/5.0</div>
                                        <div className="text-sm text-muted">Rating</div>
                                        <div className="flex justify-center mt-2">
                                            {getPerformanceStars(selectedOfficer.performance_rating)}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedOfficer.cases_assigned}</div>
                                        <div className="text-sm text-muted">Cases Assigned</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedOfficer.cases_solved}</div>
                                        <div className="text-sm text-muted">Cases Solved</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{selectedOfficer.arrest_rate}%</div>
                                        <div className="text-sm text-muted">Arrest Rate</div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted" />
                                        <span className="text-sm text-white">{selectedOfficer.contact_phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted" />
                                        <span className="text-sm text-white">{selectedOfficer.contact_email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted" />
                                        <span className="text-sm text-white">{selectedOfficer.location || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted" />
                                        <span className="text-sm text-white">Joined {new Date(selectedOfficer.join_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Specializations & Certifications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedOfficer.specialization.map((spec, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded border border-purple-500/20">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedOfficer.certifications.map((cert, index) => (
                                            <span key={index} className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm rounded border border-amber-500/20">
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Current Assignment */}
                            {selectedOfficer.current_assignment && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Current Assignment</h3>
                                    <p className="text-sm text-muted">{selectedOfficer.current_assignment}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-all">
                                    Contact Officer
                                </button>
                                <button className="flex-1 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all">
                                    View Full Profile
                                </button>
                                <button
                                    onClick={() => setSelectedOfficer(null)}
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
