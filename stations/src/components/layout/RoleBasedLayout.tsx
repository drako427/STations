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
        return <>{children}</>;
    }

    // DPO dashboard gets DPO layout
    if (isDpoDashboard) {
        return <DpoLayout>{children}</DpoLayout>;
    }

    // Everything else gets station dashboard layout
    return <DashboardLayout>{children}</DashboardLayout>;
}
