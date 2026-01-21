
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "SUPERADMIN") {
        redirect("/login");
    }

    return (
        <AdminLayoutWrapper
            sidebar={<AdminSidebar />}
            header={<AdminHeader />}
        >
            {children}
        </AdminLayoutWrapper>
    );
}


