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
        category: "Personal Electronics",
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess({ ...formData, image: imagePreview });
        onClose();
        setFormData({
            name: "",
            description: "",
            value: "",
            category: "Personal Electronics",
        });
        setImagePreview(null);
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

                        {/* Estimated Value */}
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
