"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { format } from "date-fns";

export function SubscriptionsClient({ subs }: { subs: any[] }) {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{t('admin.sidebar.subscriptions')}</h1>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-4">{t('admin.table.user')}</th>
                                <th className="px-6 py-4">{t('admin.table.plan')}</th>
                                <th className="px-6 py-4">Cycle</th>
                                <th className="px-6 py-4">{t('admin.table.date')}</th>
                                <th className="px-6 py-4">Trial Ends</th>
                                <th className="px-6 py-4">{t('admin.table.status')}</th>
                                <th className="px-6 py-4">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                            {subs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500">No subscriptions found.</td>
                                </tr>
                            ) : (
                                subs.map((sub: any) => (
                                    <SubscriptionRow
                                        key={sub.id}
                                        user={sub.clinic?.name || "Unknown Clinic"}
                                        plan={sub.plan}
                                        cycle={sub.cycle}
                                        start={format(new Date(sub.startDate), "dd/MM/yyyy")}
                                        end={sub.trialEndsAt ? format(new Date(sub.trialEndsAt), "dd/MM/yyyy") : "-"}
                                        status={sub.status}
                                        statusColor={sub.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : (sub.status === 'TRIAL' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SubscriptionRow({ user, plan, cycle, start, end, status, statusColor }: any) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900">{user}</td>
            <td className="px-6 py-4 text-slate-900">{plan}</td>
            <td className="px-6 py-4 text-slate-900">{cycle}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{start}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{end}</td>
            <td className="px-6 py-4">
                <Badge className={statusColor}>
                    {status}
                </Badge>
            </td>
            <td className="px-6 py-4">
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-600">
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    );
}
