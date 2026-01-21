
import { getAdminUsers } from "@/app/actions/admin";
import { UsersClient } from "./UsersClient";

export default async function UsersPage({ searchParams }: { searchParams: { q?: string; plan?: string; status?: string } }) {
    const users = await getAdminUsers(searchParams?.q, searchParams?.plan, searchParams?.status);

    return <UsersClient users={users} />;
}
