"use client";

import { useState } from "react";
import { X, User, MapPin, Phone, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimPropertyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (claimerData: ClaimerData) => void;
    propertyName: string;
}

interface ClaimerData {
    claimer_name: string;
    claimer_address: string;
    claimer_phone?: string;
    claimer_id?: string;
}

export default function ClaimPropertyForm({ isOpen, onClose, onSubmit, propertyName }: ClaimPropertyFormProps) {
    const [formData, setFormData] = useState<ClaimerData>({
        claimer_name: "",
        claimer_address: "",
        claimer_phone: "",
        claimer_id: ""
    });

    const [contactMethod, setContactMethod] = useState<'phone' | 'id' | 'both'>('phone');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.claimer_name.trim()) {
            alert("Claimer name is required");
            return;
        }
        
        if (!formData.claimer_address.trim()) {
            alert("Address is required");
            return;
        }

        if (contactMethod === 'phone' && !formData.claimer_phone?.trim()) {
            alert("Phone number is required");
            return;
        }

        if (contactMethod === 'id' && !formData.claimer_id?.trim()) {
            alert("ID number is required");
            return;
        }

        if (contactMethod === 'both' && !formData.claimer_phone?.trim() && !formData.claimer_id?.trim()) {
            alert("Either phone number or ID number is required");
            return;
        }

        onSubmit(formData);
        onClose();
        // Reset form
        setFormData({
            claimer_name: "",
            claimer_address: "",
            claimer_phone: "",
            claimer_id: ""
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="glass-card w-full max-w-md mx-4 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-white">Claim Property</h2>
                        <p className="text-sm text-muted mt-1">{propertyName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface/50 transition-colors"
                    >
                        <X className="h-5 w-5 text-muted" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Claimer Name */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            <User className="h-4 w-4 inline mr-2" />
                            Claimer Name *
                        </label>
                        <input
                            type="text"
                            name="claimer_name"
                            value={formData.claimer_name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            <MapPin className="h-4 w-4 inline mr-2" />
                            Address *
                        </label>
                        <textarea
                            name="claimer_address"
                            value={formData.claimer_address}
                            onChange={handleChange}
                            placeholder="Enter full address"
                            rows={3}
                            className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                            required
                        />
                    </div>

                    {/* Contact Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Contact Method
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setContactMethod('phone')}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1",
                                    contactMethod === 'phone'
                                        ? "bg-primary text-white"
                                        : "bg-surface/50 text-muted hover:bg-surface"
                                )}
                            >
                                <Phone className="h-4 w-4 inline mr-1" />
                                Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactMethod('id')}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1",
                                    contactMethod === 'id'
                                        ? "bg-primary text-white"
                                        : "bg-surface/50 text-muted hover:bg-surface"
                                )}
                            >
                                <CreditCard className="h-4 w-4 inline mr-1" />
                                ID
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactMethod('both')}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1",
                                    contactMethod === 'both'
                                        ? "bg-primary text-white"
                                        : "bg-surface/50 text-muted hover:bg-surface"
                                )}
                            >
                                Both
                            </button>
                        </div>
                    </div>

                    {/* Phone Number */}
                    {(contactMethod === 'phone' || contactMethod === 'both') && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                <Phone className="h-4 w-4 inline mr-2" />
                                Phone Number {contactMethod === 'both' ? '(Optional)' : '*'}
                            </label>
                            <input
                                type="tel"
                                name="claimer_phone"
                                value={formData.claimer_phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                required={contactMethod === 'phone'}
                            />
                        </div>
                    )}

                    {/* ID Number */}
                    {(contactMethod === 'id' || contactMethod === 'both') && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                <CreditCard className="h-4 w-4 inline mr-2" />
                                ID Number {contactMethod === 'both' ? '(Optional)' : '*'}
                            </label>
                            <input
                                type="text"
                                name="claimer_id"
                                value={formData.claimer_id}
                                onChange={handleChange}
                                placeholder="Enter ID number"
                                className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                required={contactMethod === 'id'}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-surface/50 text-white rounded-lg font-medium hover:bg-surface transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Submit Claim
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
