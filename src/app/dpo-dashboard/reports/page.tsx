"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Search, Filter, Calendar, BarChart3, TrendingUp, Users, ShieldCheck, AlertTriangle, MapPin, Eye, MoreVertical, X, ChevronDown, Clock, Activity, Globe } from "lucide-react";

interface Report {
    id: string;
    title: string;
    type: 'monthly' | 'weekly' | 'daily' | 'incident' | 'analytics';
    station?: string;
    date: string;
    status: 'published' | 'draft' | 'scheduled';
    author: string;
    downloads: number;
    size: string;
    summary: string;
    metrics?: {
        cases: number;
        suspects: number;
        arrests: number;
        clearance_rate: number;
    };
}

export default function DPOReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "monthly" | "weekly" | "daily" | "incident" | "analytics">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
    const [sortBy, setSortBy] = useState<"date" | "title" | "downloads">("date");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Mock reports data
    const [reports] = useState<Report[]>([
        {
            id: "RPT-2024-001",
            title: "National Crime Statistics - January 2024",
            type: "monthly",
            date: "2024-01-31",
            status: "published",
            author: "DPO Analytics Team",
            downloads: 245,
            size: "2.4 MB",
            summary: "Comprehensive overview of national crime statistics for January 2024, including trends and comparative analysis.",
            metrics: {
                cases: 1247,
                suspects: 892,
                arrests: 678,
                clearance_rate: 54.3
            }
        },
        {
            id: "RPT-2024-002",
            title: "Weekly Incident Report - Week 4",
            type: "weekly",
            date: "2024-01-28",
            status: "published",
            author: "National Operations Center",
            downloads: 189,
            size: "1.2 MB",
            summary: "Weekly summary of major incidents and operations across all jurisdictions.",
            metrics: {
                cases: 342,
                suspects: 256,
                arrests: 198,
                clearance_rate: 57.9
            }
        },
        {
            id: "RPT-2024-003",
            title: "Banjul Station Performance Analysis",
            type: "analytics",
            station: "Banjul Station",
            date: "2024-01-25",
            status: "published",
            author: "Regional Supervisor",
            downloads: 156,
            size: "856 KB",
            summary: "Detailed performance analysis of Banjul Station operations and efficiency metrics.",
            metrics: {
                cases: 234,
                suspects: 178,
                arrests: 145,
                clearance_rate: 61.9
            }
        },
        {
            id: "RPT-2024-004",
            title: "Major Incident Report - Armed Robbery Spree",
            type: "incident",
            date: "2024-01-22",
            status: "published",
            author: "Special Investigations Unit",
            downloads: 298,
            size: "3.1 MB",
            summary: "Comprehensive report on the armed robbery spree across multiple jurisdictions.",
            metrics: {
                cases: 12,
                suspects: 8,
                arrests: 6,
                clearance_rate: 75.0
            }
        },
        {
            id: "RPT-2024-005",
            title: "Daily Operations Summary - 2024-01-20",
            type: "daily",
            date: "2024-01-20",
            status: "published",
            author: "National Command Center",
            downloads: 89,
            size: "445 KB",
            summary: "Daily summary of all police operations and activities nationwide.",
            metrics: {
                cases: 67,
                suspects: 45,
                arrests: 38,
                clearance_rate: 56.7
            }
        },
        {
            id: "RPT-2024-006",
            title: "February 2024 Crime Forecast",
            type: "monthly",
            date: "2024-02-01",
            status: "draft",
            author: "Predictive Analytics Unit",
            downloads: 0,
            size: "1.8 MB",
            summary: "Predictive analysis and crime forecast for February 2024 based on historical data and trends.",
            metrics: {
                cases: 0,
                suspects: 0,
                arrests: 0,
                clearance_rate: 0
            }
        }
    ]);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (report.station && report.station.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === "all" || report.type === typeFilter;
        const matchesStatus = statusFilter === "all" || report.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const sortedReports = [...filteredReports].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "title":
                return a.title.localeCompare(b.title);
            case "downloads":
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case "monthly": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "weekly": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "daily": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "incident": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case "analytics": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "draft": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "scheduled": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "monthly": return Calendar;
            case "weekly": return Clock;
            case "daily": return Activity;
            case "incident": return AlertTriangle;
            case "analytics": return BarChart3;
            default: return FileText;
        }
    };

    const handleDownload = (report: Report) => {
        // Simulate download
        console.log(`Downloading report: ${report.title}`);
        // In a real app, this would trigger a file download
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">National Reports</h1>
                    <p className="text-muted mt-1">Comprehensive reports and analytics for all jurisdictions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">DPO Reports</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 border-l-4 border-l-blue-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Reports</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{reports.length}</h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-green-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                            <Download className="h-6 w-6 text-green-400" />
                        </div>
                        <Users className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Downloads</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {reports.reduce((sum, r) => sum + r.downloads, 0)}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-amber-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                            <Calendar className="h-6 w-6 text-amber-400" />
                        </div>
                        <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">This Month</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">12</h3>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-purple-400/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-purple-400/10 border border-purple-400/20">
                            <BarChart3 className="h-6 w-6 text-purple-400" />
                        </div>
                        <Globe className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Analytics Reports</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {reports.filter(r => r.type === 'analytics').length}
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
                            placeholder="Search reports by title, author, or station..."
                            className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Report Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                >
                                    <option value="all">All Types</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="daily">Daily</option>
                                    <option value="incident">Incident</option>
                                    <option value="analytics">Analytics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                >
                                    <option value="date">Date</option>
                                    <option value="title">Title</option>
                                    <option value="downloads">Downloads</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {sortedReports.map((report) => {
                    const TypeIcon = getTypeIcon(report.type);
                    return (
                        <div key={report.id} className="glass-card p-6 hover:border-blue-400/50 transition-all group">
                            {/* Report Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                                        <TypeIcon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white line-clamp-2">{report.title}</h3>
                                        <p className="text-xs text-muted mt-1">{report.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTypeColor(report.type)}`}>
                                        {report.type}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                            </div>

                            {/* Report Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Author:</span>
                                    <span className="text-white">{report.author}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Date:</span>
                                    <span className="text-white">{new Date(report.date).toLocaleDateString()}</span>
                                </div>
                                {report.station && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted">Station:</span>
                                        <span className="text-white">{report.station}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted">Size:</span>
                                    <span className="text-white">{report.size}</span>
                                </div>
                            </div>

                            {/* Metrics */}
                            {report.metrics && report.metrics.cases > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-sm font-bold text-white">{report.metrics.cases}</div>
                                        <div className="text-xs text-muted">Cases</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <div className="text-sm font-bold text-white">{report.metrics.clearance_rate}%</div>
                                        <div className="text-xs text-muted">Clearance</div>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <p className="text-xs text-muted line-clamp-3 mb-4">{report.summary}</p>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Download className="h-3 w-3" />
                                    <span>{report.downloads} downloads</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewReport(report)}
                                        className="p-2 text-muted hover:text-blue-400 transition-colors hover:bg-blue-400/10 rounded-lg"
                                        title="View report"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(report)}
                                        className="p-2 text-muted hover:text-green-400 transition-colors hover:bg-green-400/10 rounded-lg"
                                        title="Download report"
                                    >
                                        <Download className="h-4 w-4" />
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

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border w-full max-w-4xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    {(() => {
                                        const TypeIcon = getTypeIcon(selectedReport.type);
                                        return <TypeIcon className="h-6 w-6 text-blue-400" />;
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
                                    <p className="text-sm text-muted">{selectedReport.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Report Content */}
                        <div className="space-y-6">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Type</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(selectedReport.type)}`}>
                                        {selectedReport.type}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Status</div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status}
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Date</div>
                                    <div className="text-sm text-white">{new Date(selectedReport.date).toLocaleDateString()}</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-xs text-muted mb-1">Size</div>
                                    <div className="text-sm text-white">{selectedReport.size}</div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-3">Executive Summary</h3>
                                <p className="text-sm text-muted leading-relaxed">{selectedReport.summary}</p>
                            </div>

                            {/* Metrics */}
                            {selectedReport.metrics && selectedReport.metrics.cases > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-white/5 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{selectedReport.metrics.cases}</div>
                                            <div className="text-sm text-muted">Total Cases</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{selectedReport.metrics.suspects}</div>
                                            <div className="text-sm text-muted">Suspects</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{selectedReport.metrics.arrests}</div>
                                            <div className="text-sm text-muted">Arrests</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{selectedReport.metrics.clearance_rate}%</div>
                                            <div className="text-sm text-muted">Clearance Rate</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDownload(selectedReport)}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Report
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
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
