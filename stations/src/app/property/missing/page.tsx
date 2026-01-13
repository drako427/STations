"use client";

import { useState } from "react";
import { GenericInvestigationPage } from "@/components/shared/GenericInvestigationPage";
import { Package, Hash, MapPin } from "lucide-react";
import { RegisterPropertyForm } from "@/components/property/RegisterPropertyForm";

export default function MissingPropertyPage() {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [propertyList, setPropertyList] = useState<any[]>([]);

    return (
        <>
            <GenericInvestigationPage
                title="Missing Property"
                description="Recovered and reported lost/stolen items registry."
                items={propertyList}
                columns={["ID", "Property Description", "Est. Value", "Date Reported", "Location"]}
                onAddRecord={() => setIsRegisterOpen(true)}
                renderRow={(item) => (
                    <>
                        <td className="px-6 py-4 font-medium text-white">{item.id}</td>
                        <td className="px-6 py-4 text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {item.item}
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-medium">{item.value}</td>
                        <td className="px-6 py-4 text-muted">{item.reported}</td>
                        <td className="px-6 py-4 text-muted">{item.location}</td>
                    </>
                )}
            />

            <RegisterPropertyForm
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={(data) => {
                    const newProp = {
                        id: `PROP-${Math.floor(Math.random() * 900) + 100}`,
                        item: data.name,
                        value: "$0.00",
                        reported: new Date().toISOString().split('T')[0],
                        owner: "Registry Entry",
                        location: "Intake Station"
                    };
                    setPropertyList([newProp, ...propertyList]);
                }}
            />
        </>
    );
}
