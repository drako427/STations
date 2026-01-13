"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function StationLoginPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState("");
    const [showCode, setShowCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch('http://localhost:5000/api/station-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_code: accessCode.toUpperCase() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and redirect to station dashboard
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/');

        } catch (err: any) {
            setError(err.message || 'Invalid station code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Station Login</h1>
                    <p className="text-muted">Enter your station access code to continue</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Access Code</label>
                            <div className="relative">
                                <input
                                    type={showCode ? "text" : "password"}
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Enter station access code"
                                    className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCode(!showCode)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                >
                                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted mt-2">
                                6-8 character code provided by DPO
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                                    <p className="text-sm text-rose-400">{error}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-primary border-t-primary/20 animate-spin rounded-full" />
                                    Verifying...
                                </span>
                            ) : (
                                'Login to Station'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-muted">
                        Need help? Contact your DPO administrator
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs text-primary hover:text-primary/80 transition-colors mt-2"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
