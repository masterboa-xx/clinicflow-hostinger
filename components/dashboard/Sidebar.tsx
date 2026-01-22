"use client";

import { Home, Users, Calendar, Settings, Activity, FileQuestion, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getUnreadCounts } from "@/app/actions/support";

export const Sidebar = ({ className }: { className?: string }) => {
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: FileQuestion, label: "Questions", href: "/dashboard/questions" },
        { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
        { icon: HelpCircle, label: "Support", href: "/dashboard/support" },
    ];

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            const res = await getUnreadCounts();
            if (res.success) setUnreadCount(res.count || 0);
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className={cn("w-24 bg-white h-screen fixed left-0 top-0 border-r border-slate-100 flex flex-col items-center py-6 z-50", className)}>
            {/* Logo */}
            <div className="mb-10">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Activity size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 flex flex-col gap-6 w-full px-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all group relative",
                                isActive ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full" />
                            )}
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                            {item.label === "Support" && unreadCount > 0 && (
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
