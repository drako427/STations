import Link from "next/link";

export default function PropertyPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Property</h1>
            <p className="text-sm text-muted">Property records and reports.</p>
            <ul className="space-y-2">
                <li>
                    <Link href="/property/missing" className="text-primary hover:underline">Missing Property</Link>
                </li>
            </ul>
        </div>
    );
}
