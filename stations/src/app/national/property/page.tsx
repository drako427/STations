"use client";

import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Globe, Search, Database } from "lucide-react";

export default function NationalPropertyPage() {
    const items: any[] = [];

    return (
        <div className="space-y-8 animate-in">
            {/* Single horizontal property hub container */}
            <div className="glass-card p-6 border-border/50 hover:border-primary/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <Database className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Federal Asset Registry</span>
                                <div className="h-1 w-1 rounded-full bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Search</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">National Property Vault</h3>
                            <p className="text-sm text-muted mt-1">
                                Centralized database for high-value missing assets, intercepted contraband, and cultural artifacts.
                            </p>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]">
                        View Property
                    </button>
                </div>
            </div>

            {/* Horizontal divider and footer text */}
            <div className="pt-12">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted mt-6 animate-pulse">
                    View other station property
                </p>
            </div>
        </div>
    );
}
