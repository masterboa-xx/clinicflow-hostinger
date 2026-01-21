"use client";

import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { format } from "date-fns";

export function LogsClient({ logs }: { logs: any[] }) {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{t('admin.sidebar.logs')}</h1>
                <p className="text-slate-500">{language === 'ar' ? "سجل نشاطات النظام الفعلي." : "Real system audit logs."}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">{t('admin.sidebar.logs')}</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('admin.users.search')}
                                className={`py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 ${language === 'ar' ? 'pl-3 pr-10' : 'pl-10 pr-3'}`}
                            />
                            <Search className={`absolute top-2.5 w-4 h-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target ID</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">{t('admin.table.date')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500">No logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{log.admin?.email}</td>
                                        <td className="px-6 py-4 text-slate-700">{log.action}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{log.targetId || "-"}</td>
                                        <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
