"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createClinic } from "@/app/actions/admin";
import { Plus, X } from "lucide-react";

export function ClinicsClient({ users }: { users: any[] }) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newClinic, setNewClinic] = useState({ name: "", email: "", password: "", plan: "STARTER" });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`?q=${search}`);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await createClinic(newClinic);
        setIsLoading(false);

        if (res.success) {
            setIsAddModalOpen(false);
            setNewClinic({ name: "", email: "", password: "", plan: "STARTER" });
            // Router refresh handled by server action revalidate, but we can double check
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">{t('admin.clinics.title')}</h1>
                    <p className="text-slate-500">{t('admin.clinics.subtitle')}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Plus size={18} />
                    {language === 'ar' ? 'إضافة عيادة' : 'Add Clinic'}
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute top-3 w-5 h-5 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                        <input
                            type="text"
                            name="search"
                            placeholder={t('admin.clinics.search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                        />
                    </div>
                    <Button type="submit" className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white">
                        {language === 'ar' ? 'بحث' : 'Search'}
                    </Button>
                </form>
            </div>

            {/* Clinics Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-1/3">{t('admin.clinics.table.clinic')}</th>
                            <th className="px-6 py-4">{t('admin.clinics.table.subscription')}</th>
                            <th className="px-6 py-4">{t('admin.table.status')}</th>
                            <th className="px-6 py-4">{t('admin.clinics.table.patients')}</th>
                            <th className="px-6 py-4 text-end">{t('admin.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-500">No clinics found.</td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <ClinicRow
                                    key={user.id}
                                    id={user.id}
                                    name={user.name}
                                    email={user.email}
                                    subscription={user.subscription?.plan || "No Subscription"}
                                    status={user.subscription?.status || "NONE"}
                                    tickets={0} // Placeholder until we fetch ticket count in action
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Clinic Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {language === 'ar' ? 'إضافة عيادة جديدة' : 'Add New Clinic'}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="Doctor Name or Clinic Name"
                                    value={newClinic.name}
                                    onChange={e => setNewClinic({ ...newClinic, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="clinic@example.com"
                                    value={newClinic.email}
                                    onChange={e => setNewClinic({ ...newClinic, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    required
                                    type="text" // Visible for admin creation convenience usually, or password type
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="Initial Password"
                                    value={newClinic.password}
                                    onChange={e => setNewClinic({ ...newClinic, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Plan</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
                                    value={newClinic.plan}
                                    onChange={e => setNewClinic({ ...newClinic, plan: e.target.value })}
                                >
                                    <option value="STARTER">Trial (Starter)</option>
                                    <option value="PRO">Pro Plan</option>
                                    <option value="CLINIC_PLUS">Premium (Clinic+)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isLoading ? "Creating..." : "Create Clinic"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ClinicRow({ id, name, email, subscription, status, tickets }: any) {
    const { t } = useLanguage();

    const statusStyles = {
        ACTIVE: "bg-emerald-100 text-emerald-700",
        TRIAL: "bg-blue-100 text-blue-700", // Changed to blue per screenshot vibe or keep standard
        SUSPENDED: "bg-red-100 text-red-700",
        NONE: "bg-slate-100 text-slate-500"
    };

    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-4">
                <div>
                    <div className="font-bold text-slate-900 text-base">{name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{email}</div>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-500 italic">
                {/* @ts-ignore */}
                {{
                    "STARTER": "Trial",
                    "PRO": "Pro",
                    "CLINIC_PLUS": "Premium"
                }[subscription] || subscription}
            </td>
            <td className="px-6 py-4">
                <Badge className={`px-3 py-1 uppercase text-[10px] tracking-wider ${(statusStyles as any)[status] || "bg-slate-100 text-slate-500"}`}>
                    {status}
                </Badge>
            </td>
            <td className="px-6 py-4 text-slate-700 font-medium">
                {tickets} Tickets
            </td>
            <td className="px-6 py-4 text-end">
                <Link href={`/admin/clinics/${id}`}>
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                        Manage
                    </Button>
                </Link>
            </td>
        </tr>
    );
}

