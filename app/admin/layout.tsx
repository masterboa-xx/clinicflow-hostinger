
import { auth } from "@/auth";
import { Logo } from "@/components/brand/Logo";
import { LogOut, LayoutDashboard, Users, Ticket, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <Logo variant="symbol" className="w-8 h-8 text-white" />
                    <span className="font-bold text-lg tracking-tight">SuperAdmin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <AdminNavLink href="/admin/clinics" icon={<Users size={20} />} label="Clinics & Subs" />
                    <AdminNavLink href="/admin/support" icon={<Ticket size={20} />} label="Support Tickets" />
                    <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 mb-2 px-2 uppercase font-semibold">Logged in as</div>
                    <div className="px-2 text-sm font-medium truncate mb-4">{session.user.email}</div>

                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
