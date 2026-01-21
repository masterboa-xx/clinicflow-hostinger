"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { format, differenceInDays } from "date-fns";

export function PeriodsClient({ trials }: { trials: any[] }) {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">{t('admin.sidebar.periods')}</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={language === 'ar' ? "مدة Trial الافتراضية" : "Default Trial Duration"} value="14 Days/أيام" />
                <KPICard title={language === 'ar' ? "مستخدمي التجربة" : "Trial Users"} value={trials.length.toString()} />
                <KPICard title={language === 'ar' ? "تجارب منتهية" : "Expired Trials"} value="0" isRed />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">{t('admin.table.user')}</th>
                            <th className="px-6 py-4">{t('admin.table.plan')}</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Days Left</th>
                            <th className="px-6 py-4">{t('admin.table.status')}</th>
                            <th className="px-6 py-4">{t('admin.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {trials.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-500">No active trials found.</td>
                            </tr>
                        ) : (
                            trials.map((trial: any) => {
                                const daysLeft = trial.trialEndsAt ? differenceInDays(new Date(trial.trialEndsAt), new Date()) : 0;
                                return (
                                    <PeriodRow
                                        key={trial.id}
                                        user={trial.clinic?.name || "Unknown"}
                                        plan={trial.plan}
                                        start={format(new Date(trial.startDate), "dd/MM/yyyy")}
                                        end={trial.trialEndsAt ? format(new Date(trial.trialEndsAt), "dd/MM/yyyy") : "-"}
                                        left={`${daysLeft} ${language === 'ar' ? 'يوم' : 'days'}`}
                                        status="Trial"
                                        statusColor="bg-orange-100 text-orange-700"
                                    />
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KPICard({ title, value, isRed }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-2">
            <span className="text-slate-500 font-medium">{title}</span>
            <span className={`text-3xl font-bold ${isRed ? "text-red-500" : "text-slate-900"}`}>{value}</span>
        </div>
    )
}

function PeriodRow({ user, plan, start, end, left, status, statusColor }: any) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900">{user}</td>
            <td className="px-6 py-4 text-slate-700">{plan}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{start}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{end}</td>
            <td className={`px-6 py-4 font-bold ${left.includes("-") ? "text-red-500" : "text-orange-600"}`}>{left}</td>
            <td className="px-6 py-4">
                <Badge className={statusColor}>{status}</Badge>
            </td>
            <td className="px-6 py-4">
                <Button variant="secondary" size="icon" className="bg-slate-700 text-white hover:bg-slate-800 h-8 w-8">
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    )
}
