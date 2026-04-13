"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, ShieldAlert, Cpu, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<"station" | "dpo" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [credentials, setCredentials] = useState({ username: "", password: "", code: "" });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('🔓 Login attempt:', selectedRole === 'station' ? credentials.code : credentials.username, 'Role:', selectedRole);
        
        try {
            if (selectedRole === 'station') {
                console.log('📝 Access code entered:', credentials.code);
                console.log('📝 Access code uppercase:', credentials.code.toUpperCase());
                
                // Use real station login API via Next.js proxy
                const response = await fetch('/api/station-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ access_code: credentials.code.toUpperCase() })
                });

                console.log('📡 Response status:', response.status);
                const data = await response.json();
                console.log('📡 Response data:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Invalid station code');
                }

                // Store token and station info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    ...data.user,
                    role: data.user.role,
                    username: data.user.username
                }));
                console.log('✅ Station login successful, redirecting to dashboard');
                router.push('/');

            } else {
                // DPO still uses naked login for now
                const response = await fetch('/api/auth/naked-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: credentials.username,
                        password: credentials.password,
                        role: 'dpo'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Authentication failed');
                }

                // Store the received token
                localStorage.setItem('token', data.token);
                console.log('✅ DPO login successful, redirecting to dashboard');
                router.push('/dpo-dashboard');
            }
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Failed to authenticate. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleInfo = (role: "station" | "dpo") => {
        if (role === "station") {
            return {
                title: "STATION LOGIN",
                subtitle: "Local Police Station Access",
                icon: Building2,
                color: "primary"
            };
        } else {
            return {
                title: "DPO LOGIN", 
                subtitle: "Department of Police Operations",
                icon: ShieldCheck,
                color: "amber"
            };
        }
    };

    const currentRoleInfo = selectedRole ? getRoleInfo(selectedRole) : null;

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Cyber-Grid */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }} />

            {/* Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[450px] z-10 space-y-8 animate-in mt-[-50px]">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.3)] border border-white/20">
                        <ShieldAlert className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tighter text-white">STATIONS</h1>
                        <p className="text-muted text-sm font-medium tracking-widest uppercase">Secure Access Terminal</p>
                        <div className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">Naked Login</span>
                        </div>
                    </div>
                </div>

                {/* Role Selection Buttons */}
                {!selectedRole && (
                    <div className="space-y-4">
                        <div className="glass-card p-1 flex gap-1 bg-white/5 border-white/10 rounded-xl">
                            <button
                                onClick={() => setSelectedRole("station")}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all hover:bg-white/10 text-white"
                            >
                                <Building2 className="h-4 w-4" />
                                STATION LOGIN
                            </button>
                            <button
                                onClick={() => setSelectedRole("dpo")}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all hover:bg-amber-500/10 text-amber-400"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                DPO LOGIN
                            </button>
                        </div>
                    </div>
                )}

                {/* Login Form */}
                {selectedRole && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Role Header */}
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                {currentRoleInfo && <currentRoleInfo.icon className={`h-5 w-5 text-${currentRoleInfo.color}`} />}
                                <h2 className={`text-lg font-bold text-${currentRoleInfo?.color || 'primary'} uppercase tracking-wider`}>
                                    {currentRoleInfo?.title}
                                </h2>
                            </div>
                            <p className="text-xs text-muted">{currentRoleInfo?.subtitle}</p>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedRole(null)}
                            className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
                        >
                            ← Back to role selection
                        </button>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                {selectedRole === 'station' ? (
                                    // Station login - only code input
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter DPO-issued station access code"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 uppercase"
                                            value={credentials.code}
                                            onChange={(e) => setCredentials({ ...credentials, code: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    // DPO login - username and password
                                    <>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Any Username"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 uppercase"
                                                value={credentials.username}
                                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                            />
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="Any Password"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 uppercase"
                                                value={credentials.password}
                                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-[0.98] shadow-xl disabled:opacity-50 tracking-[0.2em]"
                                onClick={() => console.log('Button clicked!')}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-3 animate-pulse">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    <>
                                        QUICK ACCESS
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>

                            {/* Development Notice */}
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-xs text-amber-400 text-center">
                                    <strong>DEV MODE:</strong> Any credentials work. User auto-created if not exists.
                                </p>
                            </div>
                        </form>
                    </div>
                )}

                {/* Footer info */}
                <div className="text-center">
                    <p className="text-[10px] text-muted tracking-widest uppercase font-bold opacity-50">
                        Temporary Access Terminal. All transactions logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
