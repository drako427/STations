"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsClient(true);
        
        // Check authentication on client side only
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('🔍 Auth check - Token:', token ? 'EXISTS' : 'MISSING');
        console.log('🔍 Auth check - User:', user ? 'EXISTS' : 'MISSING');
        console.log('🔍 Auth check - User data:', user);
        
        if (token && user) {
            console.log('✅ Authentication valid');
            setIsAuthenticated(true);
        } else {
            console.log('❌ Authentication failed - missing token or user');
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        // Only redirect if we're on client side and not authenticated
        if (isClient && !isAuthenticated) {
            router.push('/login');
        }
    }, [router, isClient, isAuthenticated]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        router.push('/login');
    };

    const getUser = () => {
        if (!isClient) return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    return { logout, getUser, isClient, isAuthenticated };
}
