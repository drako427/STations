"use client";

import { useEffect, useState } from "react";

interface CaseItem {
    case_id?: number;
    title?: string;
    case_number?: string;
    status?: string;
    case_type?: string;
    date_opened?: string;
    suspect_name?: string;
    suspect_code?: string;
    suspect_image?: string;
    image?: string;
    risk_level?: string;
    description?: string;
    crime_committed?: string;
}

const buildFallbackProfileImage = (seed: string) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export default function CasesPage() {
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedCases, setExpandedCases] = useState<number[]>([]);

    const getSuspectProfileImage = (caseItem: CaseItem) => {
        const fallbackSeed = caseItem.suspect_name || caseItem.suspect_code || caseItem.case_number || caseItem.title || String(caseItem.case_id || "case");

        const storedImage = caseItem.suspect_image || caseItem.image;

        if (storedImage) {
            return storedImage.startsWith("http")
                ? storedImage
                : `http://localhost:5000${storedImage}`;
        }

        return buildFallbackProfileImage(fallbackSeed);
    };

    useEffect(() => {
        async function loadCases() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Please login first");
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/cases', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load cases');
                }

                const data = await response.json();
                console.log('Cases API payload:', data);
                console.log('Cases API image fields:', JSON.stringify(data.map((item: CaseItem) => ({
                    case_id: item.case_id,
                    suspect_name: item.suspect_name,
                    suspect_image: item.suspect_image,
                    image: item.image
                })), null, 2));
                setCases(data);
            } catch (err) {
                setError(err.message || "Failed to load cases");
            } finally {
                setLoading(false);
            }
        }

        loadCases();
    }, []);

    const toggleCaseDescription = (caseId: number) => {
        setExpandedCases((current) =>
            current.includes(caseId)
                ? current.filter((id) => id !== caseId)
                : [...current, caseId]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading cases...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-400">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Investigative Cases</h1>
            
            {cases.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400">No cases found</div>
                    <div className="text-gray-500 mt-2">Create cases from the suspects page</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.map((caseItem, index) => {
                        const caseId = caseItem.case_id ?? index;
                        const isExpanded = expandedCases.includes(caseId);

                        return (
                        <div key={caseId} className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg shadow-black/20">
                            <div className="border-b border-gray-700 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-5">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={getSuspectProfileImage(caseItem)}
                                        alt={caseItem.suspect_name || 'Case profile'}
                                        className="h-20 w-20 rounded-xl object-cover border border-gray-600 bg-gray-800 shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.src = buildFallbackProfileImage(
                                                caseItem.suspect_name || caseItem.suspect_code || caseItem.case_number || 'Unknown'
                                            );
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Case File</p>
                                                <h3 className="text-xl font-bold text-white">{caseItem.title || 'Untitled Case'}</h3>
                                            </div>
                                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                                                {caseItem.status || 'Unknown'}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-semibold text-white">
                                                {caseItem.suspect_name || 'No suspect linked'}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Code: {caseItem.suspect_code || 'N/A'}
                                            </div>
                                            {caseItem.risk_level && (
                                                <div className="text-sm text-amber-300">Risk Level: {caseItem.risk_level}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
                                    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Case Number</div>
                                        <div className="mt-1 font-medium text-white">{caseItem.case_number || 'N/A'}</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Type</div>
                                        <div className="mt-1 font-medium text-white">{caseItem.case_type || 'Other'}</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 col-span-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Date Opened</div>
                                        <div className="mt-1 font-medium text-white">{caseItem.date_opened || 'N/A'}</div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleCaseDescription(caseId)}
                                    className="mb-4 w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                                >
                                    {isExpanded ? 'Hide Description' : 'View Description'}
                                </button>

                                {isExpanded && (
                                    <div className="text-gray-300 text-sm mb-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                                        {caseItem.description || 'No description available'}
                                    </div>
                                )}
                            
                                {caseItem.crime_committed && (
                                    <div className="rounded-lg border border-red-700 bg-red-900/20 p-3">
                                        <div className="text-red-400 text-sm">
                                            <strong>Crime:</strong> {caseItem.crime_committed}
                                        </div>
                                    </div>
                                )}
                            
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="text-gray-500 text-xs">
                                        Case ID: {caseItem.case_id || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
}
