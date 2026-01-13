import Link from "next/link";

export default function NationalPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Federal Database</h1>
            <p className="text-sm text-muted">Choose a national view below.</p>
            <ul className="space-y-2">
                <li>
                    <Link href="/national/suspects" className="text-primary hover:underline">National Suspects</Link>
                </li>
                <li>
                    <Link href="/national/unsolved" className="text-primary hover:underline">National Unsolved</Link>
                </li>
                <li>
                    <Link href="/national/property" className="text-primary hover:underline">National Property</Link>
                </li>
            </ul>
        </div>
    );
}
