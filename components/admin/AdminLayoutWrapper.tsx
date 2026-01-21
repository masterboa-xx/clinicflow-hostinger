"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { cn } from "@/lib/utils";

export function AdminLayoutWrapper({ children, sidebar, header }: { children: React.ReactNode, sidebar: React.ReactNode, header: React.ReactNode }) {
    const { dir } = useLanguage();

    // If RTL, sidebar is right (needs styling adjustment in Sidebar component too, or we handle it here?)
    // Actually, AdminSidebar has fixed classes. We need to pass dir to it or wrap it.
    // Simplifying: layout checks dir. 

    return (
        <div className="min-h-screen bg-slate-50" dir={dir}>
            <div className={cn("fixed top-0 bottom-0 z-50 transition-all duration-300", dir === "rtl" ? "right-0" : "left-0")}>
                {sidebar}
            </div>

            <div className={cn("transition-all duration-300", dir === "rtl" ? "mr-64" : "ml-64")}>
                {header}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
