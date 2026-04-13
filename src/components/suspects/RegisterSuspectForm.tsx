"use client";

import { useState, useRef } from "react";
import { X, Upload, Camera, Calendar, MapPin, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterSuspectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

export function RegisterSuspectForm({ isOpen, onClose, onSuccess }: RegisterSuspectFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        crime: "",
        locationOfCrime: "",
        placeOfArrest: "",
        dateOfArrest: "",
    });

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            
            // Add form fields
            formDataToSend.append('full_name', formData.name);
            if (formData.dob) formDataToSend.append('date_of_birth', formData.dob);
            formDataToSend.append('crime_committed', formData.crime);
            formDataToSend.append('physical_description', `Arrested at: ${formData.placeOfArrest}, Crime location: ${formData.locationOfCrime}`);
            formDataToSend.append('risk_level', 'medium');
            formDataToSend.append('is_national', '0');
            
            // Add image file if selected
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            const token = localStorage.getItem('token');
            console.log('🔍 RegisterSuspectForm - Checking token:', token ? 'exists' : 'missing');
            console.log('📡 RegisterSuspectForm - Sending FormData with file:', selectedFile?.name);
            console.log('📡 RegisterSuspectForm - FormData contents:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
            }

            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            console.log('📡 RegisterSuspectForm - Making request to:', '/api/suspects');
            
            const response = await fetch('/api/suspects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            console.log('📡 RegisterSuspectForm API response status:', response.status);

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Non-JSON response received:', text);
                throw new Error('Server returned non-JSON response');
            }

            const responseData = await response.json();

            if (!response.ok) {
                console.error('❌ RegisterSuspectForm API error:', responseData);
                throw new Error(responseData.error || 'Failed to register suspect');
            }

            // Call onSuccess with the new suspect data
            const newSuspect = {
                ...formData,
                image: responseData.image,
                suspect_id: responseData.suspect_id
            };
            onSuccess(newSuspect);
            
            // Reset form and close
            setFormData({
                name: "",
                dob: "",
                crime: "",
                locationOfCrime: "",
                placeOfArrest: "",
                dateOfArrest: "",
            });
            setImagePreview(null);
            setSelectedFile(null);
            onClose();
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register suspect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Register New Suspect</h2>
                            <p className="text-xs text-muted leading-tight">Create a new suspect profile in the database.</p>
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
                    <div className="flex flex-col items-center justify-center gap-4 py-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "h-32 w-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative group",
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
                                    <span className="text-xs text-muted mt-2">Upload Photo</span>
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
                        <p className="text-[10px] text-muted text-center max-w-[200px]">
                            Clear facial photo required for biometric identification.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> Full Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. John Doe"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Year of Birth */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" /> Year of Birth (Optional)
                            </label>
                            <input
                                type="date"
                                placeholder="e.g. 1995"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white [color-scheme:dark]"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>

                        {/* Crime Committed */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5" /> Crime Committed
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Grand Theft Auto, Narcotics Distribution"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                                value={formData.crime}
                                onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                            />
                        </div>

                        {/* Location of Crime */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> Location of Crime
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Downtown Sector 4"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                                value={formData.locationOfCrime}
                                onChange={(e) => setFormData({ ...formData, locationOfCrime: e.target.value })}
                            />
                        </div>

                        {/* Place of Arrest */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> Place of Arrest
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. 42nd Street Subway"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                                value={formData.placeOfArrest}
                                onChange={(e) => setFormData({ ...formData, placeOfArrest: e.target.value })}
                            />
                        </div>

                        {/* Date of Arrest */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" /> Date of Arrest
                            </label>
                            <input
                                required
                                type="date"
                                className="w-full bg-white/5 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white [color-scheme:dark]"
                                value={formData.dateOfArrest}
                                onChange={(e) => setFormData({ ...formData, dateOfArrest: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition-all text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    Register Suspect
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Error Display */}
                {error && (
                    <div className="px-6 pb-4">
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                            <p className="text-sm text-rose-400">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
