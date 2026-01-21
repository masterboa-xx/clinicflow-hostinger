
import { getAdminStats, getRecentActivity } from "@/app/actions/admin";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
    try {
        const stats = await getAdminStats();
        const recentActivity = await getRecentActivity();

        return <DashboardClient stats={stats} recentActivity={recentActivity} />;
    } catch (error: any) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="text-xl font-bold mb-2">Erreur de chargement du tableau de bord</h2>
                <p className="bg-red-50 p-4 rounded text-xs font-mono inline-block text-left max-w-full overflow-auto">
                    {error?.message || "Erreur inconnue"}
                    <br />
                    {JSON.stringify(error)}
                </p>
            </div>
        );
    }
}
