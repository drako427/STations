"use client";

import { useState, useEffect, useRef } from "react";
import { Users, ShieldCheck, Clock, FileText, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Charts = dynamic(() => import("@/components/dashboard/Charts"), { ssr: false });

interface DashboardPayload {
  station: any;
  stats: any[];
  caseData: any[];
  categoryData: any[];
}

interface DashboardCacheEntry {
  token: string;
  fetchedAt: number;
  data: DashboardPayload;
}

const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;
let dashboardCache: DashboardCacheEntry | null = null;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState<DashboardPayload>({
    station: null,
    stats: [],
    caseData: [],
    categoryData: []
  });
  const hasRenderableData = Boolean(data.station) || data.stats.length > 0 || data.caseData.length > 0 || data.categoryData.length > 0;
  const hasRenderableDataRef = useRef(hasRenderableData);

  useEffect(() => {
    hasRenderableDataRef.current = hasRenderableData;
  }, [hasRenderableData]);

  useEffect(() => {
    console.log('🚀 Dashboard component mounting...');
    
    const fetchDashboardData = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      console.log('🔍 Starting dashboard data fetch...');
      
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('🔍 Dashboard - Token:', token ? 'EXISTS' : 'MISSING');
        console.log('🔍 Dashboard - User:', user ? 'EXISTS' : 'MISSING');
        
        if (!token) {
          console.error('❌ No token found, redirecting to login...');
          window.location.href = '/login';
          return;
        }

        const hasValidCache =
          dashboardCache &&
          dashboardCache.token === token &&
          Date.now() - dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS;

        if (hasValidCache) {
          setData(dashboardCache.data);
          setError(null);
          return;
        }

        if (!hasRenderableDataRef.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        console.log('Fetching dashboard data...');
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status);
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error('Dashboard fetch error:', {
            status: response.status,
            statusText: response.statusText,
            response: responseData
          });
          
          // Handle expired/invalid token
          if (response.status === 401 || responseData?.error?.includes('token')) {
            console.error('Token expired or invalid, clearing and redirecting...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
            return;
          }
          
          throw new Error(responseData.error || 'Failed to fetch dashboard data');
        }

        console.log('Dashboard data received:', responseData);
        setData(responseData);
        dashboardCache = {
          token,
          fetchedAt: Date.now(),
          data: responseData
        };
        setError(null);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
        
        // Retry up to 3 times for network/resource errors
        if (retryCount < 3 && (err.message?.includes('Failed to fetch') || err.message?.includes('Network'))) {
          console.log(`Retrying dashboard fetch... Attempt ${retryCount + 1}/3`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDashboardData();
  }, [retryCount]);

  if (loading && !hasRenderableData) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted animate-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  if (error && !hasRenderableData) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-rose-400 animate-in">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg font-bold uppercase tracking-widest">Digital Link Failure</p>
        <p className="text-sm text-muted max-w-md text-center">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            RETRY UPLINK
          </button>
          {retryCount < 3 && (
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="mt-4 px-6 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
            >
              RETRY ({3 - retryCount} LEFT)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white line-clamp-1">
            {data.station ? `${data.station.station_name} Dashboard` : 'Command Center'}
          </h1>
          <p className="text-muted mt-1">
            {data.station ? `Station Code: ${data.station.station_code} | ${data.station.location || 'Location pending'}` : 'Real-time investigative overview and metrics.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 border border-border rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            Export JSON
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 leading-tight">
            New Case
          </button>
        </div>
      </div>

      {(refreshing || (error && hasRenderableData)) && (
        <div className={cn(
          "rounded-lg border px-4 py-2 text-xs font-medium",
          refreshing
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-amber-400/30 bg-amber-400/10 text-amber-300"
        )}>
          {refreshing
            ? "Refreshing dashboard data in background..."
            : `Using last loaded dashboard data. Update failed: ${error}`}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat: any) => {
          const Icon = stat.name === "Total Suspects" ? Users :
            stat.name === "Active Cases" ? FileText :
              stat.name === "Closed (MTD)" ? ShieldCheck : Clock;

          return (
            <div key={stat.name} className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  stat.trend === "up" ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
                )}>
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">{stat.name}</p>
                <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Charts caseData={data.caseData} categoryData={data.categoryData} />
      </div>
    </div>
  );
}
