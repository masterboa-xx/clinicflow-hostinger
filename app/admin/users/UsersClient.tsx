"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UsersClient({ users }: { users: any[] }) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [search, setSearch] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`?q=${search}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{t('admin.users.title')}</h1>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Filter by Plan */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">{t('admin.users.filter.plan')}</label>
                        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                            <option>All Plans</option>
                            <option value="STARTER">Starter</option>
                            <option value="PRO">Pro</option>
                            <option value="CLINIC_PLUS">Clinic Plus</option>
                        </select>
                    </div>

                    {/* Filter by Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">{t('admin.users.filter.status')}</label>
                        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                            <option>All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="TRIAL">Trial</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">{t('admin.users.search')}</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className={`absolute top-2.5 w-4 h-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('admin.users.search')}
                                    className={`w-full h-10 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                                />
                            </div>
                            <Button type="submit" size="sm" className="bg-[#1e293b] text-white hover:bg-[#0f172a]">
                                Filter
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-4">{t('admin.table.user')}</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Lang</th>
                                <th className="px-6 py-4">{t('admin.table.plan')}</th>
                                <th className="px-6 py-4">{t('admin.table.status')}</th>
                                <th className="px-6 py-4">{t('admin.table.date')}</th>
                                <th className="px-6 py-4">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <UserRow
                                        key={user.id}
                                        name={user.name}
                                        email={user.email}
                                        role={user.ticketLanguage}
                                        plan={user.subscription?.plan || "No Plan"}
                                        status={user.subscription?.status || "No Sub"}
                                        startDate={format(new Date(user.createdAt), "MMM dd, yyyy")}
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

function UserRow({ name, email, role, plan, status, startDate }: any) {
    const statusStyles = {
        ACTIVE: "bg-emerald-100 text-emerald-700",
        TRIAL: "bg-orange-100 text-orange-700",
        SUSPENDED: "bg-red-100 text-red-700",
        CANCELLED: "bg-gray-100 text-gray-700",
        "No Sub": "bg-slate-100 text-slate-500"
    };

    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-900">{name}</td>
            <td className="px-6 py-4 text-slate-500">{email}</td>
            <td className="px-6 py-4 text-slate-900 uppercase">{role}</td>
            <td className="px-6 py-4 text-slate-900">{plan}</td>
            <td className="px-6 py-4">
                <Badge className={(statusStyles as any)[status] || "bg-slate-100 text-slate-700"}>
                    {status}
                </Badge>
            </td>
            <td className="px-6 py-4 text-slate-500">{startDate}</td>
            <td className="px-6 py-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </Button>
            </td>
        </tr>
    );
}
