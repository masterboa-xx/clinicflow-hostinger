"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageContext";
import { format } from "date-fns";

export function DashboardClient({ stats, recentActivity }: { stats: any, recentActivity: any }) {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('admin.dashboard.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('admin.header.superadmin')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
                        {format(new Date(), "MMM dd, yyyy")}
                    </span>
                    <Button variant="primary" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        {t('admin.users.title')} {/* Reusing a key or add 'New User' key? Using title for now or simple hardcode fallback */}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={t('admin.stats.users')}
                    value={stats.totalUsers.toString()}
                    icon={<Users className="text-white" />}
                    iconBg="bg-[#1e293b]"
                    description={language === 'ar' ? "العيادات المسجلة" : "Registered Clinics"}
                />
                <StatsCard
                    title={t('admin.stats.activeSubs')}
                    value={stats.activeSubs.toString()}
                    icon={<CreditCard className="text-white" />}
                    iconBg="bg-emerald-500"
                    description={language === 'ar' ? "الخطط النشطة" : "Active Plans"}
                />
                <StatsCard
                    title={t('admin.stats.revenue')}
                    value={`${stats.monthlyRevenue} DH`}
                    icon={<TrendingUp className="text-white" />}
                    iconBg="bg-[#1e293b]"
                    description={language === 'ar' ? "الإيرادات المقدرة" : "Estimated Revenue"}
                    descriptionColor="text-emerald-600"
                />
                <StatsCard
                    title={t('admin.stats.trials')}
                    value={stats.trials.toString()}
                    icon={<AlertCircle className="text-white" />}
                    iconBg="bg-orange-500"
                    description={language === 'ar' ? "التجارب النشطة" : "Active Trials"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent User Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">{t('admin.users.title')}</h2>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-start">{t('admin.table.user')}</th>
                                    <th className="px-6 py-4 text-start">{t('admin.table.plan')}</th>
                                    <th className="px-6 py-4 text-start">{t('admin.table.date')}</th>
                                    <th className="px-6 py-4 text-start">{t('admin.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentActivity.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-500">No recent activity found.</td>
                                    </tr>
                                ) : (
                                    recentActivity.map((clinic: any) => (
                                        <ActivityRow
                                            key={clinic.id}
                                            name={clinic.name}
                                            role={clinic.ticketLanguage}
                                            action={clinic.subscription?.plan || "No Plan"}
                                            date={format(new Date(clinic.createdAt), "yyyy-MM-dd")}
                                            status={clinic.subscription?.status || "No Sub"}
                                            statusColor={clinic.subscription?.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">{t('admin.sidebar.settings')}</h3>
                    </div>

                    <div className="space-y-2">
                        <QuickActionItem label={t('admin.users.filter.plan')} />
                        <QuickActionItem label={t('admin.users.filter.status')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, iconBg, description, descriptionColor = "text-slate-500" }: any) {
    return (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white bg-slate-900 px-3 py-1 rounded-md">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${iconBg} shadow-sm`}>
                        {icon}
                    </div>
                </div>
                <p className={`text-xs ${descriptionColor} font-medium`}>{description}</p>
            </CardContent>
        </Card>
    );
}

function ActivityRow({ name, role, action, date, status, statusColor }: any) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div>
                    <div className="font-semibold text-slate-900">{name}</div>
                    <div className="text-xs text-slate-500">Lang: {role}</div>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-600">{action}</td>
            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{date}</td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColor}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}

function QuickActionItem({ label }: { label: string }) {
    return (
        <button className="w-full text-start px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0 font-medium">
            {label}
        </button>
    )
}
