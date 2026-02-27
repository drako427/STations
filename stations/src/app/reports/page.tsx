"use client";

import { useState, useEffect } from "react";
import { 
    FileText, Download, Calendar, Filter, Search, BarChart3, 
    TrendingUp, Users, Shield, Clock, AlertCircle, CheckCircle,
    XCircle, Eye, Edit, Trash2, Plus, ChevronDown, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
    id: string;
    title: string;
    type: "daily" | "weekly" | "monthly" | "custom";
    status: "generating" | "completed" | "failed";
    createdAt: string;
    generatedAt?: string;
    fileSize?: string;
    downloadUrl?: string;
    description: string;
    parameters: {
        startDate: string;
        endDate: string;
        stationId: number;
        includeSuspects: boolean;
        includeCases: boolean;
        includeProperties: boolean;
    };
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockReports: Report[] = [
            {
                id: "1",
                title: "Daily Activity Report - Station 1",
                type: "daily",
                status: "completed",
                createdAt: "2024-02-20T08:00:00Z",
                generatedAt: "2024-02-20T08:05:00Z",
                fileSize: "2.4 MB",
                downloadUrl: "/api/reports/download/1",
                description: "Complete daily activity report including all suspects, cases, and properties",
                parameters: {
                    startDate: "2024-02-19",
                    endDate: "2024-02-19",
                    stationId: 1,
                    includeSuspects: true,
                    includeCases: true,
                    includeProperties: true
                }
            },
            {
                id: "2",
                title: "Weekly Summary Report",
                type: "weekly",
                status: "completed",
                createdAt: "2024-02-19T09:00:00Z",
                generatedAt: "2024-02-19T09:15:00Z",
                fileSize: "8.7 MB",
                downloadUrl: "/api/reports/download/2",
                description: "Weekly summary of all police activities and statistics",
                parameters: {
                    startDate: "2024-02-13",
                    endDate: "2024-02-19",
                    stationId: 1,
                    includeSuspects: true,
                    includeCases: true,
                    includeProperties: true
                }
            },
            {
                id: "3",
                title: "Monthly Crime Statistics",
                type: "monthly",
                status: "generating",
                createdAt: "2024-02-20T10:00:00Z",
                description: "Monthly crime statistics and trend analysis",
                parameters: {
                    startDate: "2024-01-01",
                    endDate: "2024-01-31",
                    stationId: 1,
                    includeSuspects: true,
                    includeCases: true,
                    includeProperties: false
                }
            },
            {
                id: "4",
                title: "Custom Investigation Report",
                type: "custom",
                status: "failed",
                createdAt: "2024-02-18T14:00:00Z",
                description: "Custom report for specific investigation case",
                parameters: {
                    startDate: "2024-02-10",
                    endDate: "2024-02-18",
                    stationId: 1,
                    includeSuspects: true,
                    includeCases: false,
                    includeProperties: true
                }
            }
        ];

        setTimeout(() => {
            setReports(mockReports);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || report.type === filterType;
        const matchesStatus = filterStatus === "all" || report.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
            case "generating": return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
            case "failed": return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <AlertCircle className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "generating": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "failed": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "daily": return <Calendar className="h-4 w-4" />;
            case "weekly": return <BarChart3 className="h-4 w-4" />;
            case "monthly": return <TrendingUp className="h-4 w-4" />;
            case "custom": return <FileText className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "daily": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "weekly": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            case "monthly": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            case "custom": return "text-green-400 bg-green-400/10 border-green-400/20";
            default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
        }
    };

    const handleGenerateReport = async (reportConfig: any) => {
        setGeneratingReport(true);
        // Simulate report generation
        setTimeout(() => {
            const newReport: Report = {
                id: String(reports.length + 1),
                title: reportConfig.title,
                type: reportConfig.type,
                status: "completed",
                createdAt: new Date().toISOString(),
                generatedAt: new Date().toISOString(),
                fileSize: "1.2 MB",
                downloadUrl: "/api/reports/download/" + (reports.length + 1),
                description: reportConfig.description,
                parameters: reportConfig.parameters
            };
            setReports(prev => [newReport, ...prev]);
            setGeneratingReport(false);
            setShowGenerateModal(false);
        }, 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Reports</h1>
                    <p className="text-muted mt-1">Generate and manage station reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                    <button 
                        onClick={() => setShowGenerateModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-emerald-400 text-xs font-medium">+12%</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Total Reports</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{reports.length}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div className="text-emerald-400 text-xs font-medium">+8%</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Completed</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {reports.filter(r => r.status === "completed").length}
                        </h3>
                    </div>
                </div>
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <RefreshCw className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="text-blue-400 text-xs font-medium">Processing</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Generating</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                            {reports.filter(r => r.status === "generating").length}
                        </h3>
                    </div>
                </div>
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <Download className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="text-purple-400 text-xs font-medium">This Week</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted">Downloads</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mt-1">47</h3>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All Types</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="generating">Generating</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="text-sm text-muted">
                    Showing {filteredReports.length} of {reports.length} reports
                </div>
            </div>

            {/* Reports Table */}
            <div className="glass-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-border sticky top-0">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Report</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Created</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Size</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-white">{report.title}</div>
                                            <div className="text-xs text-muted mt-1">{report.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            getTypeColor(report.type)
                                        )}>
                                            {getTypeIcon(report.type)}
                                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            getStatusColor(report.status)
                                        )}>
                                            {getStatusIcon(report.status)}
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-muted">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                            <div className="text-xs mt-1">
                                                {new Date(report.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-muted">
                                            {report.fileSize || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {report.status === "completed" && (
                                                <button className="p-2 text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setSelectedReport(report)}
                                                className="p-2 text-muted hover:text-white transition-colors hover:bg-white/10 rounded-lg"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-muted hover:text-white transition-colors hover:bg-white/10 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-card p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Generate New Report</h2>
                        <GenerateReportForm 
                            onSubmit={handleGenerateReport}
                            onCancel={() => setShowGenerateModal(false)}
                            loading={generatingReport}
                        />
                    </div>
                </div>
            )}

            {/* Report Details Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-card p-6 w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Report Details</h2>
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="p-2 text-muted hover:text-white transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <ReportDetails report={selectedReport} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Generate Report Form Component
function GenerateReportForm({ onSubmit, onCancel, loading }: any) {
    const [formData, setFormData] = useState({
        title: "",
        type: "daily",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        includeSuspects: true,
        includeCases: true,
        includeProperties: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            parameters: {
                stationId: 1,
                startDate: formData.startDate,
                endDate: formData.endDate,
                includeSuspects: formData.includeSuspects,
                includeCases: formData.includeCases,
                includeProperties: formData.includeProperties
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-white mb-2">Report Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter report title"
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-white mb-2">Report Type</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="custom">Custom Report</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    placeholder="Enter report description"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white mb-2">End Date</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white mb-2">Include Sections</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.includeSuspects}
                            onChange={(e) => setFormData({...formData, includeSuspects: e.target.checked})}
                            className="rounded border-border bg-white/5 text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm text-white">Suspects Data</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.includeCases}
                            onChange={(e) => setFormData({...formData, includeCases: e.target.checked})}
                            className="rounded border-border bg-white/5 text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm text-white">Cases Data</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.includeProperties}
                            onChange={(e) => setFormData({...formData, includeProperties: e.target.checked})}
                            className="rounded border-border bg-white/5 text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm text-white">Properties Data</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

// Report Details Component
function ReportDetails({ report }: { report: Report }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-muted">Report Title</label>
                    <p className="text-sm text-white mt-1">{report.title}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted">Type</label>
                    <p className="text-sm text-white mt-1 capitalize">{report.type}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted">Status</label>
                    <p className="text-sm text-white mt-1 capitalize">{report.status}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted">File Size</label>
                    <p className="text-sm text-white mt-1">{report.fileSize || "N/A"}</p>
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-muted">Description</label>
                <p className="text-sm text-white mt-1">{report.description}</p>
            </div>

            <div>
                <label className="text-xs font-medium text-muted">Date Range</label>
                <p className="text-sm text-white mt-1">
                    {new Date(report.parameters.startDate).toLocaleDateString()} - {new Date(report.parameters.endDate).toLocaleDateString()}
                </p>
            </div>

            <div>
                <label className="text-xs font-medium text-muted">Included Sections</label>
                <div className="flex flex-wrap gap-2 mt-1">
                    {report.parameters.includeSuspects && (
                        <span className="px-2 py-1 bg-blue-400/10 text-blue-400 text-xs rounded-full border border-blue-400/20">
                            Suspects
                        </span>
                    )}
                    {report.parameters.includeCases && (
                        <span className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-full border border-green-400/20">
                            Cases
                        </span>
                    )}
                    {report.parameters.includeProperties && (
                        <span className="px-2 py-1 bg-purple-400/10 text-purple-400 text-xs rounded-full border border-purple-400/20">
                            Properties
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                    <label className="text-xs font-medium text-muted">Created At</label>
                    <p className="text-sm text-white mt-1">
                        {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                {report.generatedAt && (
                    <div>
                        <label className="text-xs font-medium text-muted">Generated At</label>
                        <p className="text-sm text-white mt-1">
                            {new Date(report.generatedAt).toLocaleDateString()} {new Date(report.generatedAt).toLocaleTimeString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
