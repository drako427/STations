"use client";

import { X, User, MapPin, Phone, CreditCard, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
    property_id: number;
    property_code: string;
    item_name: string;
    description: string;
    category: string;
    estimated_value: number;
    status: 'missing' | 'recovered' | 'claimed' | 'disposed';
    location_found: string;
    date_found: string;
    date_reported: string;
    owner_name: string;
    owner_contact: string;
    image_url: string;
    created_at: string;
}

interface ViewClaimedDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
}

export default function ViewClaimedDetails({ isOpen, onClose, property }: ViewClaimedDetailsProps) {
    if (!isOpen || !property) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in p-4">
            <div className="glass-card w-full max-w-sm animate-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <div>
                        <h2 className="text-base font-bold text-white">Claim Details</h2>
                        <p className="text-xs text-muted mt-1">{property.item_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-surface/50 transition-colors"
                    >
                        <X className="h-4 w-4 text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                    {/* Property Image - Smaller */}
                    {property.image_url && (
                        <div className="aspect-video bg-surface/50 rounded-lg overflow-hidden">
                            <img 
                                src={`http://localhost:5000${property.image_url}`}
                                alt={property.item_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.item_name}`;
                                }}
                            />
                        </div>
                    )}

                    {/* Combined Information - More Compact */}
                    <div className="space-y-2">
                        {/* Claimer Info - Primary */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                            <h3 className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Claimer Information
                            </h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted">Name:</span>
                                    <span className="text-white font-medium">{property.owner_name || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Contact:</span>
                                    <span className="text-white font-medium">{property.owner_contact || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Property Info - Secondary */}
                        <div className="bg-surface/50 border border-border rounded-lg p-2">
                            <h3 className="text-xs font-semibold text-white mb-1">Property Details</h3>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted">Code:</span>
                                    <span className="text-white">{property.property_code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Value:</span>
                                    <span className="text-emerald-400">${property.estimated_value || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Category:</span>
                                    <span className="text-white">{property.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Date:</span>
                                    <span className="text-white">{new Date(property.date_found).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted">Status:</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-400/10 text-blue-400 border-blue-400/20">
                                Claimed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="p-3 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full px-3 py-2 bg-surface/50 text-white rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
