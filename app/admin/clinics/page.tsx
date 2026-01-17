
import { getAllClinics } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClinicsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const query = (await searchParams).query || "";
    const clinics = await getAllClinics(query);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clinics Management</h1>
                    <p className="text-slate-500">Manage clinics and subscriptions.</p>
                </div>
                {/* Placeholder for future "Invite Clinic" feature */}
                {/* <Button>Invite Clinic</Button> */}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <form className="relative flex items-center max-w-md">
                    <Search className="absolute left-3 text-slate-400" size={18} />
                    <input
                        name="query"
                        defaultValue={query}
                        placeholder="Search by name, email, or slug..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <Button type="submit" variant="ghost" className="ml-2">Search</Button>
                </form>
            </div>

            {/* Clinics Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="p-4 font-medium">Clinic Name</th>
                            <th className="p-4 font-medium">Subscription</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Patients</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clinics.map((clinic) => (
                            <tr key={clinic.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-slate-900">{clinic.name}</div>
                                    <div className="text-xs text-slate-500">{clinic.email}</div>
                                </td>
                                <td className="p-4">
                                    {clinic.subscription ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{clinic.subscription.plan}</span>
                                            <span className="text-xs text-slate-400">{clinic.subscription.cycle}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">No Subscription</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={clinic.subscription?.status || "NONE"} />
                                </td>
                                <td className="p-4 text-slate-600">
                                    {clinic._count.turns} tickets
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/clinics/${clinic.id}`}>
                                        <Button variant="outline" size="sm">Manage</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {clinics.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    No clinics found matching "{query}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        ACTIVE: "bg-green-100 text-green-700",
        TRIAL: "bg-blue-100 text-blue-700",
        SUSPENDED: "bg-red-100 text-red-700",
        CANCELLED: "bg-slate-100 text-slate-600",
        NONE: "bg-slate-100 text-slate-400",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.NONE}`}>
            {status}
        </span>
    );
}
