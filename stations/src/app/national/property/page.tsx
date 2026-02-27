"use client";

import { useState, useEffect } from "react";
import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Globe, Search, Database, X, Package, Calendar, DollarSign, MapPin, Eye, Trash2, Hand } from "lucide-react";
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

export default function NationalPropertyPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stationName, setStationName] = useState<string>('');
    const [stations, setStations] = useState<any[]>([]);
    const [otherStations, setOtherStations] = useState<any[]>([]);
    const [stationsLoading, setStationsLoading] = useState(false);
    const [selectedStation, setSelectedStation] = useState<any | null>(null);
    const [stationModalOpen, setStationModalOpen] = useState(false);
    const [stationProperties, setStationProperties] = useState<Property[]>([]);
    const [stationPropertiesLoading, setStationPropertiesLoading] = useState(false);
    const [selectedStationCategory, setSelectedStationCategory] = useState<string>('all');
    const [stationSearchQuery, setStationSearchQuery] = useState<string>('');
    const [otherStationsSearchQuery, setOtherStationsSearchQuery] = useState<string>('');

    useEffect(() => {
        // Get station name from localStorage user data
        const userStr = localStorage.getItem('user');
        console.log('🔍 User data from localStorage:', userStr);
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                console.log('✅ Parsed user data:', user);
                console.log('🏢 Station name:', user.station_name);
                console.log('🆔 Station ID:', user.station_id);
                console.log('👤 User role:', user.role);
                setStationName(user.station_name || 'Unknown Station');
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                setStationName('Unknown Station');
            }
        } else {
            console.warn('⚠️ No user data found in localStorage');
            setStationName('Unknown Station');
        }
        
        // Fetch all stations
        fetchStations();
    }, []);

    const fetchStations = async () => {
        setStationsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No token found for fetchStations');
                return;
            }

            console.log('📡 Fetching stations from /api/stations');
            const response = await fetch('/api/stations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(`📡 Stations response status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ All stations received:', data);
                
                // Filter out any entries that don't look like actual stations
                // Remove entries with "DPO" in the name or other non-station patterns
                const actualStations = data.filter((station: any) => {
                    const stationName = (station.station_name || '').toLowerCase();
                    const isDPO = stationName.includes('dpo') || stationName.includes('district police officer');
                    const isValidStation = station.station_id && station.station_name && station.access_code;
                    
                    console.log(`🔍 Checking station "${station.station_name}": isDPO=${isDPO}, isValid=${isValidStation}`);
                    
                    return isValidStation && !isDPO;
                });
                
                console.log('✅ Filtered actual stations:', actualStations);
                setStations(actualStations);
                
                // Filter out current station to get other stations
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        const currentStationId = user.station_id;
                        console.log(`🔍 Filtering stations - Current station ID: ${currentStationId}`);
                        
                        const other = actualStations.filter((station: any) => station.station_id !== currentStationId);
                        console.log('✅ Other stations after filtering:', other);
                        setOtherStations(other);
                    } catch (error) {
                        console.error('❌ Error filtering stations:', error);
                    }
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Failed to fetch stations:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            }
        } catch (error) {
            console.error('❌ Error fetching stations:', error);
        } finally {
            setStationsLoading(false);
        }
    };

    const fetchStationProperties = async (stationId: number) => {
        console.log(`🔍 Fetching properties for station_id: ${stationId}`);
        setStationPropertiesLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No token found for fetchStationProperties');
                return;
            }

            const response = await fetch(`/api/properties?station_id=${stationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(`📡 Response status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Received ${data.length} properties for station ${stationId}:`, data);
                setStationProperties(data);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Failed to fetch station properties:`, {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                setStationProperties([]);
            }
        } catch (error) {
            console.error('❌ Error fetching station properties:', error);
            setStationProperties([]);
        } finally {
            setStationPropertiesLoading(false);
        }
    };

    const handleViewStation = (station: any) => {
        console.log('� Viewing station:', station);
        setSelectedStation(station);
        setStationModalOpen(true);
        setStationProperties([]); // Clear previous properties
        setSelectedStationCategory('all'); // Reset category filter
        setStationSearchQuery(''); // Reset search query
        fetchStationProperties(station.station_id);
    };

    // Filter station properties based on selected category and search query
    const filteredStationProperties = selectedStationCategory === 'all' 
        ? stationProperties 
        : stationProperties.filter(property => {
            const matchesCategory = property.category === selectedStationCategory;
            const matchesSearch = stationSearchQuery === '' || 
                property.item_name.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
                property.description.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
                property.property_code.toLowerCase().includes(stationSearchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

    // Filter other stations based on search query
    const filteredOtherStations = otherStations.filter(station => {
        if (otherStationsSearchQuery === '') return true;
        const searchLower = otherStationsSearchQuery.toLowerCase();
        return (
            station.station_name.toLowerCase().includes(searchLower) ||
            (station.location && station.location.toLowerCase().includes(searchLower)) ||
            station.access_code.toLowerCase().includes(searchLower) ||
            station.station_code.toLowerCase().includes(searchLower)
        );
    });

    const categories = [
        { id: 'all', label: 'All Items', icon: Package },
        { id: 'ID Card', label: 'ID Card', icon: '🆔' },
        { id: 'Car Keys', label: 'Car Keys', icon: '🔑' },
        { id: 'Car', label: 'Car', icon: '🚗' },
        { id: 'Other Stuff', label: 'Other Stuff', icon: '📦' }
    ];

    const fetchProperties = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await fetch('/api/properties', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await response.json();
            setProperties(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProperty = () => {
        setIsModalOpen(true);
        fetchProperties();
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

    // Filter properties based on selected category
    const filteredProperties = selectedCategory === 'all' 
        ? properties 
        : properties.filter(property => property.category === selectedCategory);

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
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stationName} Property Registry</h3>
                            <p className="text-sm text-muted mt-1">
                                Centralized database for high-value missing assets, intercepted contraband, and cultural artifacts.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleViewProperty}
                        className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]"
                    >
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
                
                {/* Search Bar for Other Stations */}
                <div className="mt-6 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search stations by name, location, or access code..."
                            value={otherStationsSearchQuery}
                            onChange={(e) => setOtherStationsSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {otherStationsSearchQuery && (
                            <button
                                onClick={() => setOtherStationsSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-surface/50 transition-colors"
                            >
                                <X className="h-4 w-4 text-muted" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Other Stations Section */}
            <div className="space-y-6">
                {stationsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Database className="h-12 w-12 text-primary animate-pulse mb-4" />
                        <p className="text-sm text-muted">Loading other stations...</p>
                    </div>
                ) : otherStations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted mb-4" />
                        <p className="text-sm text-muted">No other stations available</p>
                    </div>
                ) : filteredOtherStations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted mb-4" />
                        <p className="text-sm text-muted">No stations found matching "{otherStationsSearchQuery}"</p>
                        <button
                            onClick={() => setOtherStationsSearchQuery('')}
                            className="mt-2 px-4 py-2 bg-surface/50 border border-border rounded-lg text-sm text-white hover:bg-surface transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <>
                        {otherStationsSearchQuery && (
                            <div className="mb-4 p-3 bg-surface/50 rounded-lg">
                                <p className="text-sm text-white">
                                    Showing <span className="font-bold text-primary">{filteredOtherStations.length}</span> 
                                    {filteredOtherStations.length !== otherStations.length ? ` of ${otherStations.length}` : ''} 
                                    stations matching "{otherStationsSearchQuery}"
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredOtherStations.map((station) => (
                            <div key={station.station_id} className="glass-card p-4 hover:border-primary/50 transition-all group cursor-pointer" onClick={() => handleViewStation(station)}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Database className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-sm line-clamp-1">{station.station_name}</h3>
                                        <p className="text-xs text-muted">{station.location || 'Unknown Location'}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted">Access Code:</span>
                                        <span className="text-white font-mono">{station.access_code}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted">Status:</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-border">
                                    <button className="w-full px-3 py-2 bg-surface/50 text-white rounded-lg text-xs font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2">
                                        <Eye className="h-3 w-3" />
                                        View Properties
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>

            {/* Properties Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in p-4">
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div>
                                <h2 className="text-xl font-bold text-white">{stationName} Property Registry</h2>
                                <p className="text-sm text-muted mt-1">All registered properties from {stationName}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-surface/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Category Filter Buttons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
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

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Database className="h-12 w-12 text-primary animate-pulse mb-4" />
                                    <p className="text-sm text-muted">Loading properties...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <X className="h-12 w-12 text-rose-400 mb-4" />
                                    <p className="text-sm text-rose-400">{error}</p>
                                </div>
                            ) : filteredProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted mb-4" />
                                    <p className="text-sm text-muted">No {selectedCategory === 'all' ? 'properties' : selectedCategory.toLowerCase()} found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                        </div>
                    </div>
                </div>
            )}

            {/* Station Properties Modal */}
            {stationModalOpen && selectedStation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in p-4">
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedStation.station_name} Properties</h2>
                                <p className="text-sm text-muted mt-1">Properties from {selectedStation.location || 'Unknown Location'}</p>
                            </div>
                            <button
                                onClick={() => setStationModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-surface/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Category Filter Buttons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedStationCategory(category.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                            selectedStationCategory === category.id
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-surface/50 text-muted hover:bg-surface hover:text-white border border-border"
                                        )}
                                    >
                                        <span>{typeof category.icon === 'string' ? category.icon : <category.icon className="h-4 w-4" />}</span>
                                        {category.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar - Always visible for better UX */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                                    <input
                                        type="text"
                                        placeholder={selectedStationCategory === 'all' 
                                            ? "Search all properties..." 
                                            : `Search ${selectedStationCategory.toLowerCase()} properties...`
                                        }
                                        value={stationSearchQuery}
                                        onChange={(e) => setStationSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 bg-surface/50 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {stationSearchQuery && (
                                        <button
                                            onClick={() => setStationSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-surface/50 transition-colors"
                                        >
                                            <X className="h-4 w-4 text-muted" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {stationPropertiesLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Database className="h-12 w-12 text-primary animate-pulse mb-4" />
                                    <p className="text-sm text-muted">Loading {selectedStation.station_name} properties...</p>
                                </div>
                            ) : stationProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted mb-4" />
                                    <p className="text-sm text-muted">No properties found for {selectedStation.station_name}</p>
                                    <p className="text-xs text-muted mt-2">Station ID: {selectedStation.station_id}</p>
                                </div>
                            ) : filteredStationProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted mb-4" />
                                    <p className="text-sm text-muted">No {selectedStationCategory === 'all' ? 'properties' : selectedStationCategory.toLowerCase()} found for {selectedStation.station_name}</p>
                                    <p className="text-xs text-muted mt-2">
                                        {stationSearchQuery ? `No results for "${stationSearchQuery}"` : `Station ID: ${selectedStation.station_id}`}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 bg-surface/50 rounded-lg">
                                        <p className="text-sm text-white">
                                            Showing <span className="font-bold text-primary">{filteredStationProperties.length}</span> 
                                            {selectedStationCategory === 'all' ? '' : ` ${selectedStationCategory.toLowerCase()}`} 
                                            {stationSearchQuery ? ` matching "${stationSearchQuery}"` : ''} 
                                            {filteredStationProperties.length !== stationProperties.length ? ` of ${stationProperties.length} total` : ''} 
                                            properties for {selectedStation.station_name}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredStationProperties.map((property, index) => (
                                        <div key={property.property_id || `station-property-${index}`} className="glass-card p-4 hover:border-primary/50 transition-all group">
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
