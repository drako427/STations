"use client";

import { useEffect, useState } from "react";

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setCases(data);
            } catch (err) {
                setError(err.message || "Failed to load cases");
            } finally {
                setLoading(false);
            }
        }

        loadCases();
    }, []);

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
                    {cases.map((caseItem: any, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-bold mb-2">{caseItem.title || 'Untitled Case'}</h3>
                            <div className="text-gray-400 text-sm mb-4">
                                <div>Case Number: {caseItem.case_number || 'N/A'}</div>
                                <div>Status: {caseItem.status || 'Unknown'}</div>
                                <div>Type: {caseItem.case_type || 'Other'}</div>
                                <div>Date: {caseItem.date_opened || 'N/A'}</div>
                            </div>
                            
                            {caseItem.suspect_name && (
                                <div className="bg-gray-700 rounded p-4 mb-4">
                                    <div className="font-semibold mb-2">Suspect: {caseItem.suspect_name}</div>
                                    <div className="text-gray-400 text-sm">
                                        <div>Code: {caseItem.suspect_code || 'N/A'}</div>
                                        {caseItem.risk_level && (
                                            <div>Risk Level: {caseItem.risk_level}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-gray-300 text-sm mb-4">
                                {caseItem.description || 'No description available'}
                            </div>
                            
                            {caseItem.crime_committed && (
                                <div className="bg-red-900/20 border border-red-700 rounded p-3">
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
                    ))}
                </div>
            )}
        </div>
    );
}
