"use client";

import { Users, Clock, CheckCircle, Ticket } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/components/providers/LanguageContext";

interface StatsCardsProps {
    dailyTotal: number;
    waitingCount: number;
    completedCount: number;
    avgTime: number;
}

export function StatsCards({ dailyTotal, waitingCount, completedCount, avgTime }: StatsCardsProps) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard
                title={t("dashboard.stats.today")}
                value={dailyTotal}
                icon={<Ticket size={20} />}
                color="blue"
            />
             <StatCard
                title={t("dashboard.stats.waiting")}
                value={waitingCount}
                icon={<Users size={20} />}
                color="orange"
            />
             <StatCard
                title={t("dashboard.stats.done")}
                value={completedCount}
                icon={<CheckCircle size={20} />}
                color="emerald"
            />
             <StatCard
                title={t("dashboard.stats.avgTime")}
                value={`${avgTime} min`}
                icon={<Clock size={20} />}
                color="purple"
            />
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: "blue" | "orange" | "emerald" | "purple" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
            <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0", colors[color])}>
                {icon}
            </div>
            <div>
                <div className="text-xl md:text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-[10px] md:text-xs text-slate-500 font-medium">{title}</div>
            </div>
        </div>
    );
}
