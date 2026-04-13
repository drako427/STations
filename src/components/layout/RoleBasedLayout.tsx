"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "./DashboardLayout";
import { DpoLayout } from "./DpoLayout";

export function RoleBasedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Check if current path is DPO dashboard
    const isDpoDashboard = pathname.startsWith('/dpo-dashboard');
    const isLoginPage = pathname === "/login";

    // Login page gets no layout
    if (isLoginPage) {
        return <div suppressHydrationWarning>{children}</div>;
    }

    // DPO dashboard gets DPO layout
    if (isDpoDashboard) {
        return <div suppressHydrationWarning><DpoLayout>{children}</DpoLayout></div>;
    }

    // Everything else gets station dashboard layout
    return <div suppressHydrationWarning><DashboardLayout>{children}</DashboardLayout></div>;
}
