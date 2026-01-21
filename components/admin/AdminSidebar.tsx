"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/components/providers/LanguageContext";
import { useState, useEffect } from "react";
import { getUnreadCounts } from "@/app/actions/support";

export function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { href: "/admin/dashboard", label: t('admin.sidebar.overview'), icon: LayoutDashboard },
        { href: "/admin/clinics", label: t('admin.sidebar.clinics'), icon: Users },
        { href: "/admin/messages", label: t('admin.sidebar.messages'), icon: Mail },
        { href: "/admin/support", label: t('admin.sidebar.support'), icon: MessageSquare },
        { href: "/admin/settings", label: t('admin.sidebar.settings'), icon: Settings },
    ];

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await getUnreadCounts();
                if (res && res.success) setUnreadCount(res.count || 0);
            } catch (e) {
                console.error("Failed to fetch unread counts", e);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className={cn("w-64 bg-[#0f172a] text-white flex flex-col h-full border-r border-slate-800", className)}>
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3 font-bold text-lg tracking-wide">
                    <Logo variant="icon" className="w-8 h-8 text-emerald-500" />
                    <span>SuperAdmin</span>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-slate-800/80 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-white")} />
                            <span>{item.label}</span>
                            {item.label === t('admin.sidebar.support') && unreadCount > 0 && (
                                <div className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-slate-800/50 bg-[#0f172a]">
                <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Logged in as</p>
                    <p className="text-xs font-medium text-slate-300 truncate">superadmin@clinicflow.com</p>
                </div>
                <form action="/api/auth/signout" method="POST">
                    <button className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors w-full">
                        <LogOut className="w-4 h-4" />
                        {t('admin.signout')}
                    </button>
                </form>
            </div>
        </aside>
    );
}
