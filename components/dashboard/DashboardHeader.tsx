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
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm relative">
            {/* LEFT: STATUS */}
            <div className="flex items-center w-[140px]">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse relative">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                    </span>
                    {t("header.status.active")}
                </div>
            </div>

            {/* CENTER: LOGO & NAME */}
            <Link href="/dashboard" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 transition-transform hover:scale-105">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-slate-100 overflow-hidden ring-2 ring-slate-50/50">
                    {logo ? (
                        <img src={logo} alt={clinicName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-indigo-600">{clinicName?.[0] || "C"}</span>
                    )}
                </div>
                <span className="font-bold text-slate-800 text-lg hidden md:block tracking-tight">{clinicName}</span>
            </Link>

            {/* RIGHT: CONTROLS */}
            <div className="flex items-center justify-end gap-3 w-[140px]">
                {/* Language Switcher */}
                <div className="flex bg-slate-50 rounded-lg p-1 gap-1 border border-slate-100">
                    {(["fr", "en", "ar"] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={clsx(
                                "px-2 py-1 rounded-md text-xs font-bold transition-all",
                                language === lang ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {lang === "fr" ? "FR" : lang === "en" ? "EN" : "AR"}
                        </button>
                    ))}
                </div>

                <Link href="/dashboard/settings">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                        <Settings className="w-5 h-5" />
                    </Button>
                </Link>

                <form action={async () => { await logout(); }}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title={t("logout")}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </header>
    );
};
