import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Constant Sidebar */}
            <div className="hidden lg:block w-24 fixed left-0 top-0 h-full z-40 border-r border-slate-100 bg-white">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-24 flex-1 flex flex-col min-h-screen w-full">
                {children}
            </div>
        </div>
    );
}
