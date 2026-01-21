
import { getAdminUsers } from "@/app/actions/admin";
import { ClinicsClient } from "./ClinicsClient";

export default async function ClinicsPage({ searchParams }: { searchParams: { q?: string } }) {
    const users = await getAdminUsers(searchParams?.q);
    // Note: To get specific "tickets" count, we might need to update the action or include it in the query.
    // For now, it will show 0 or default.
    return <ClinicsClient users={users} />;
}
