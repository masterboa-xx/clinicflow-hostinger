
import { getAdminDashboardStats } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertCircle, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-2">Welcome back, SuperAdmin.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Clinics"
                    value={stats.totalClinics}
                    icon={<Users className="text-blue-500" />}
                    description="Registered clinics"
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    icon={<CreditCard className="text-green-500" />}
                    description={`+${stats.trialSubscriptions} on Trial`}
                />
                <StatsCard
                    title="Est. Monthly Revenue"
                    value={`$${stats.mrr}`}
                    icon={<TrendingUp className="text-purple-500" />}
                    description="Based on active plans"
                />
                <StatsCard
                    title="Open Tickets"
                    value={stats.openTickets}
                    icon={<AlertCircle className="text-orange-500" />}
                    description="Requires attention"
                    highlight={stats.openTickets > 0}
                />
            </div>

            {/* Recent Activity Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-slate-500 text-center py-8">
                        No recent activity logged.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, icon, description, highlight = false }: any) {
    return (
        <Card className={`${highlight ? "border-orange-200 bg-orange-50" : "bg-white"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}
