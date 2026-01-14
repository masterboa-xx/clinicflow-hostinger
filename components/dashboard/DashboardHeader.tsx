"use client";

import { Button } from "@/components/ui/Button";
import { logout } from "@/app/actions/auth";
import { Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/components/providers/LanguageContext";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo"; // Using Logo if available, or text fallback as in dashboard-client

interface DashboardHeaderProps {
    clinicName: string;
    logo?: string | null;
}

export function DashboardHeader({ clinicName, logo }: DashboardHeaderProps) {
    const { t, language, setLanguage } = useLanguage();

    return (
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            {/* LEFT: LOGO */}
            <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-100 overflow-hidden">
                    {logo ? (
                        <img src={logo} alt={clinicName} className="w-full h-full object-cover" />
                    ) : (
                        clinicName?.[0] || "C"
                    )}
                </div>
                <span className="font-bold text-slate-800 text-lg hidden md:block">{clinicName}</span>
            </Link>

            {/* CENTER: CLINIC INFO */}
            <div className="flex flex-col items-center">
                <h1 className="font-bold text-slate-800 text-sm md:text-base">{clinicName}</h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t("header.status.active")}
                </div>
            </div>

            {/* RIGHT: CONTROLS */}
            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                    {(["fr", "en", "ar"] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={clsx(
                                "px-2 py-1 rounded-md text-xs font-bold transition-all",
                                language === lang ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {lang === "fr" ? "🇫🇷" : lang === "en" ? "🇺🇸" : "🇲🇦"}
                        </button>
                    ))}
                </div>

                <Link href="/dashboard/settings">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <Settings className="w-5 h-5" />
                    </Button>
                </Link>

                <form action={async () => { await logout(); }}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" title={t("logout")}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </header>
    );
};
