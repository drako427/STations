"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Loader2, AlertTriangle, Calendar, DollarSign, Search, X, Trash2, Hand, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegisterPropertyForm } from "@/components/property/RegisterPropertyForm";
import ClaimPropertyForm from "@/components/property/ClaimPropertyForm";
import ViewClaimedDetails from "@/components/property/ViewClaimedDetails";
import DeleteConfirmationModal from "@/components/property/DeleteConfirmationModal";

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
    const [isClaimOpen, setIsClaimOpen] = useState(false);
    const [isViewClaimOpen, setIsViewClaimOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [propertyList, setPropertyList] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showSearch, setShowSearch] = useState<boolean>(false);

    const categories = [
        { id: 'all', label: 'All Items', icon: Package },
        { id: 'ID Card', label: 'ID Card', icon: '🆔' },
        { id: 'Car Keys', label: 'Car Keys', icon: '🔑' },
        { id: 'Car', label: 'Car', icon: '🚗' },
        { id: 'Other Stuff', label: 'Other Stuff', icon: '📦' }
    ];

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
                const response = await fetch('/api/properties', {
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

    const handleDeleteProperty = (property: Property) => {
        setSelectedProperty(property);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProperty) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/properties/${selectedProperty.property_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 Delete property response status:', response.status);
            
            if (response.ok) {
                // Remove property from local state
                setPropertyList(prev => prev.filter(property => property.property_id !== selectedProperty.property_id));
                console.log('✅ Property deleted successfully');
                setIsDeleteOpen(false);
                setSelectedProperty(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Failed to delete property:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            }
        } catch (error) {
            console.error('❌ Error deleting property:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClaimProperty = (property: Property) => {
        setSelectedProperty(property);
        setIsClaimOpen(true);
    };

    const handleClaimSubmit = async (claimerData: any) => {
        if (!selectedProperty) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await fetch(`/api/properties/${selectedProperty.property_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'claimed',
                    owner_name: claimerData.claimer_name,
                    owner_contact: claimerData.claimer_phone || claimerData.claimer_id,
                    claimer_address: claimerData.claimer_address,
                    claimer_phone: claimerData.claimer_phone,
                    claimer_id: claimerData.claimer_id
                })
            });

            console.log('📡 Claim property response status:', response.status);
            
            if (response.ok) {
                // Update property in local state
                setPropertyList(prev => prev.map(property => 
                    property.property_id === selectedProperty.property_id 
                        ? { ...property, status: 'claimed', owner_name: claimerData.claimer_name, owner_contact: claimerData.claimer_phone || claimerData.claimer_id }
                        : property
                ));
                console.log('✅ Property marked as claimed');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Failed to claim property:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            }
        } catch (error) {
            console.error('❌ Error claiming property:', error);
        }
    };

    const handleViewClaimed = (property: Property) => {
        setSelectedProperty(property);
        setIsViewClaimOpen(true);
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

    // Filter properties based on selected category and search query
    const filteredProperties = propertyList.filter(property => {
        const matchesCategory = selectedCategory === 'all' || property.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            property.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.property_code.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Missing Property</h1>
                    <p className="text-muted">Recovered and reported lost/stolen items registry.</p>
                </div>
                <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Property
                </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => {
                            setSelectedCategory(category.id);
                            setShowSearch(category.id !== 'all');
                            setSearchQuery('');
                        }}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            selectedCategory === category.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-surface/50 text-muted hover:bg-surface hover:text-white border border-border"
                        )}
                    >
                        <span>{typeof category.icon === 'string' ? category.icon : <category.icon className="h-4 w-4" />}</span>
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Search Bar - Shows when category is selected */}
            {showSearch && (
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-muted" />
                        <input
                            type="text"
                            placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder-muted outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 rounded-lg hover:bg-surface/50 transition-colors"
                            >
                                <X className="h-4 w-4 text-muted" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Property Grid */}
            {filteredProperties.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Package className="h-16 w-16 text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {selectedCategory === 'all' ? 'No Properties Found' : `No ${selectedCategory} Found`}
                    </h3>
                    <p className="text-muted">
                        {selectedCategory === 'all' 
                            ? 'No missing properties have been registered yet.'
                            : `No ${selectedCategory.toLowerCase()} have been registered yet.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProperties.map((property, index) => (
                        <div key={property.property_id || `property-${index}`} className="glass-card p-4 hover:border-primary/50 transition-all group">
                            {/* Image */}
                            <div className="aspect-square bg-surface/50 rounded-lg mb-4 overflow-hidden">
                                {property.image_url ? (
                                    <img 
                                        src={`http://localhost:5000${property.image_url}`}
                                        alt={property.item_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.item_name}`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-12 w-12 text-muted" />
                                    </div>
                                )}
                            </div>

                            {/* Property Details */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-sm line-clamp-2">{property.item_name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status || 'missing')} inline-block mt-1`}>
                                            {(property.status || 'missing').charAt(0).toUpperCase() + (property.status || 'missing').slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        {property.status === 'claimed' ? (
                                            <button
                                                onClick={() => handleViewClaimed(property)}
                                                className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                                                title="View claim details"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleClaimProperty(property)}
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                                                title="Mark as claimed"
                                            >
                                                <Hand className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteProperty(property)}
                                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                                            title="Delete property"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-muted text-xs line-clamp-2">{property.description || 'No description'}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>{property.estimated_value || '0.00'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(property.date_reported).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="text-xs text-muted">{property.property_code}</span>
                                    <span className="text-xs text-muted">{property.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RegisterPropertyForm
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={(data) => {
                    setPropertyList(prev => [data, ...prev]);
                    setIsRegisterOpen(false);
                }}
            />

            <ClaimPropertyForm
                isOpen={isClaimOpen}
                onClose={() => setIsClaimOpen(false)}
                onSubmit={handleClaimSubmit}
                propertyName={selectedProperty?.item_name || ''}
            />

            <ViewClaimedDetails
                isOpen={isViewClaimOpen}
                onClose={() => setIsViewClaimOpen(false)}
                property={selectedProperty}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedProperty(null);
                }}
                onConfirm={confirmDelete}
                propertyName={selectedProperty?.item_name || ''}
                isLoading={isDeleting}
            />
        </div>
    );
}
