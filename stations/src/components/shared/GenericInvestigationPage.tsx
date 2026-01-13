"use client";

import { Search, Filter, MoreVertical, Briefcase, Plus } from "lucide-react";

interface PageTemplateProps {
    title: string;
    description: string;
    items: any[];
    columns: string[];
    renderRow: (item: any) => React.ReactNode;
    onAddRecord?: () => void;
}

export function GenericInvestigationPage({ title, description, items, columns, renderRow, onAddRecord }: PageTemplateProps) {
    return (
        <div className="space-y-8 animate-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">{title}</h1>
                    <p className="text-muted mt-1">{description}</p>
                </div>
                <button
                    onClick={onAddRecord}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 w-fit leading-tight"
                >
                    <Plus className="h-4 w-4" />
                    {title.includes("Property") ? "Register Property" : "Add Record"}
                </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-border">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">{col}</th>
                                ))}
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    {renderRow(item)}
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-muted hover:text-white transition-colors">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
