
import { getAdminStats, getRecentActivity } from "@/app/actions/admin";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();
    const recentActivity = await getRecentActivity();

    return <DashboardClient stats={stats} recentActivity={recentActivity} />;
}
