"use client";

import { useState, useRef } from "react";
import { X, Upload, Camera, Package, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterPropertyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

export function RegisterPropertyForm({ isOpen, onClose, onSuccess }: RegisterPropertyFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        value: "",
        category: "Other Stuff",
    });

    const categories = [
        { value: "ID Card", label: "ID Card" },
        { value: "Car Keys", label: "Car Keys" },
        { value: "Car", label: "Car" },
        { value: "Other Stuff", label: "Other Stuff" }
    ];

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('item_name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('estimated_value', formData.value);
            submitData.append('status', 'missing');
            submitData.append('location_found', 'Unknown');
            submitData.append('date_found', new Date().toISOString().split('T')[0]);
            submitData.append('owner_name', 'Unknown');
            submitData.append('owner_contact', 'Unknown');
            
            // Add image if present
            if (imagePreview) {
                // Convert base64 back to blob for upload
                const response = await fetch(imagePreview);
                const blob = await response.blob();
                submitData.append('image', blob, 'property.jpg');
            }

            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            console.log('📡 Properties API response status:', response.status);
            console.log('📡 Properties API response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Properties API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Property registered successfully:', result);
            
            onSuccess({ ...formData, image: imagePreview });
            onClose();
            setFormData({
                name: "",
                description: "",
                value: "",
                category: "Other Stuff",
            });
            setImagePreview(null);
        } catch (error: any) {
            console.error('Error registering property:', error);
            // You could add error state handling here
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Register Property</h2>
                            <p className="text-xs text-muted leading-tight">Add a new missing or recovered item to the registry.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Image Uploader */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "h-40 w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative group",
                                imagePreview && "border-solid border-primary"
                            )}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-muted mt-2 font-medium">Upload Item Photo</span>
                                    <span className="text-xs text-muted/50 mt-1">PNG, JPG or WebP up to 5MB</span>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                                <Info className="h-3 w-3" /> Item Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Rolex Submariner, MacBook Pro"
                                className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/30"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                                Item Description
                            </label>
                            <textarea
                                placeholder="Describe markings, serial numbers, or condition..."
                                className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/30 min-h-[100px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value} className="bg-surface">
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Estimated Value */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                                Estimated Value ($)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/30"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition-all text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Register Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
