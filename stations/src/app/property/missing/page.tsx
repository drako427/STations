"use client";

import { useState, useEffect } from "react";
import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Package, Hash, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { RegisterPropertyForm } from "@/components/property/RegisterPropertyForm";

interface Property {
    property_id: number;
    property_code: string;
    item_name: string;
    description: string;
    category: string;
    estimated_value: number;
    status: 'missing' | 'recovered' | 'claimed' | 'disposed';
    location_found: string;
    date_reported: string;
    date_found: string;
    owner_name: string;
    owner_contact: string;
    image_url: string;
    created_at: string;
}

export default function MissingPropertyPage() {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [propertyList, setPropertyList] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch properties from database
    useEffect(() => {
        const fetchProperties = async () => {
            const token = localStorage.getItem('token');
            console.log('🔍 Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/properties', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📡 Properties API response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Properties API error:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch properties');
                }

                const data = await response.json();
                setPropertyList(data);
            } catch (err: any) {
                console.error('Error fetching properties:', err);
                setError(err.message || 'Failed to load properties');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleNewProperty = async (newPropertyData: any) => {
        // Refresh the properties list to show the new property
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 handleNewProperty - Checking token:', token ? 'exists' : 'missing');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }
            
            const response = await fetch('http://localhost:5000/api/properties', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 handleNewProperty API response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ handleNewProperty API error:', response.status, errorData);
                
                if (response.status === 401) {
                    console.error('🔐 Authentication failed - redirecting to login');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                
                throw new Error(errorData.error || `Failed to fetch properties (${response.status})`);
            }

            const data = await response.json();
            setPropertyList(data);
        } catch (err: any) {
            console.error('Error refreshing properties:', err);
            setError(err.message || 'Failed to refresh properties');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "missing": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "recovered": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "claimed": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "disposed": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
            default: return "text-muted bg-white/5 border-border";
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted animate-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Loading property database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-rose-400 animate-in">
                <AlertTriangle className="h-12 w-12" />
                <p className="text-lg font-bold uppercase tracking-widest">Database Connection Failed</p>
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
        <>
            <GenericInvestigationPage
                title="Missing Property"
                description="Recovered and reported lost/stolen items registry."
                items={propertyList}
                columns={["Property Code", "Item Name", "Value", "Status", "Date Reported"]}
                onAddRecord={() => setIsRegisterOpen(true)}
                renderRow={(item) => (
                    <>
                        <td className="px-6 py-4 font-medium text-white">{item.property_code}</td>
                        <td className="px-6 py-4 text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {item.item_name}
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-medium">${item.estimated_value || '0.00'}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-muted">{new Date(item.date_reported).toLocaleDateString()}</td>
                    </>
                )}
            />

            <RegisterPropertyForm
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={handleNewProperty}
            />
        </>
    );
}
