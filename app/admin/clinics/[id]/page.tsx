
import { getClinicDetails, getClinicAuditLogs, updateSubscription } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const clinic = await getClinicDetails(id);

    if (!clinic) {
        redirect("/admin/clinics");
    }

    const logs = await getClinicAuditLogs(id);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Link href="/admin/clinics" className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ChevronLeft size={16} className="mr-1" />
                Back to Clinics
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{clinic.name}</h1>
                    <p className="text-slate-500 font-mono text-sm">{clinic.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action={async (formData) => {
                                    "use server";
                                    const plan = formData.get("plan") as any;
                                    const status = formData.get("status") as any;
                                    const cycle = formData.get("cycle") as any;
                                    const endDate = formData.get("endDate") as string;

                                    await updateSubscription(clinic.id, { plan, status, cycle, endDate: endDate || null });
                                    redirect(\`/admin/clinics/\${id}\`);
              }}
                            className="space-y-4"
              >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                                    <select name="plan" defaultValue={clinic.subscription?.plan || "STARTER"} className="w-full p-2 border rounded-md">
                                        <option value="STARTER">Starter</option>
                                        <option value="PRO">Pro</option>
                                        <option value="CLINIC_PLUS">Clinic+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                                    <select name="cycle" defaultValue={clinic.subscription?.cycle || "MONTHLY"} className="w-full p-2 border rounded-md">
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select name="status" defaultValue={clinic.subscription?.status || "TRIAL"} className="w-full p-2 border rounded-md">
                                        <option value="ACTIVE">Active</option>
                                        <option value="TRIAL">Trial</option>
                                        <option value="SUSPENDED">Suspended</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date (YYYY-MM-DD)</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        defaultValue={clinic.subscription?.endDate ? clinic.subscription.endDate.toISOString().split('T')[0] : ""}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit">
                                    <Save size={16} className="mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="text-sm border-b pb-2 last:border-0 border-slate-100">
                                    <div className="flex justify-between font-medium text-slate-700">
                                        <span>{log.action}</span>
                                        <span className="text-slate-400 text-xs">{log.createdAt.toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        By {log.admin.email}
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-slate-400 italic text-sm">No history found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Clinic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <span className="block text-slate-400 text-xs">Email</span>
                            <span className="font-medium">{clinic.email}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Slug</span>
                            <Link href={\`https://app.wapimweb.com/p/\${clinic.slug}\`} target="_blank" className="text-blue-600 hover:underline">
                            {clinic.slug}
                        </Link>
                    </div>
                    <div>
                        <span className="block text-slate-400 text-xs">Joined</span>
                        <span className="font-medium">{clinic.createdAt.toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div >
    </div >
  );
}
