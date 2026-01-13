"use client";

import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Briefcase, Clock, ShieldCheck } from "lucide-react";

export default function CasesPage() {
    const cases: any[] = [];

    return (
        <GenericInvestigationPage
            title="Investigative Cases"
            description="Overview of all local active and closed investigations."
            items={cases}
            columns={["Case ID", "Title", "Type", "Status", "Lead Agent"]}
            renderRow={(item) => (
                <>
                    <td className="px-6 py-4 font-medium text-white">{item.id}</td>
                    <td className="px-6 py-4 text-foreground">{item.title}</td>
                    <td className="px-6 py-4 text-muted">{item.type}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.status === "Active" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                            item.status === "Closed" ? "text-muted bg-white/5 border-border" : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            }`}>
                            {item.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-muted">{item.lead}</td>
                </>
            )}
        />
    );
}
