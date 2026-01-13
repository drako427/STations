"use client";

import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Ghost, Calendar, AlertCircle } from "lucide-react";

export default function UnsolvedCasesPage() {
    const cases: any[] = [];

    return (
        <GenericInvestigationPage
            title="Unsolved Cases"
            description="Tracking long-term open and cold cases requiring fresh intelligence."
            items={cases}
            columns={["Case ID", "Title", "Days Open", "Last Lead", "Location"]}
            renderRow={(item) => (
                <>
                    <td className="px-6 py-4 flex items-center gap-2 font-medium text-white">
                        <Ghost className="h-4 w-4 text-primary" />
                        {item.id}
                    </td>
                    <td className="px-6 py-4 text-foreground">{item.title}</td>
                    <td className="px-6 py-4 text-rose-400">{item.daysOpen} days</td>
                    <td className="px-6 py-4 text-muted">{item.lastLead}</td>
                    <td className="px-6 py-4 text-muted">{item.location}</td>
                </>
            )}
        />
    );
}
