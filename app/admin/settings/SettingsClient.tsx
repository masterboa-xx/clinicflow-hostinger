"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageContext";
import { Upload, RefreshCw } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function SettingsClient() {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('admin.settings.title')}</h1>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                {/* App Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">{t('admin.settings.app')}</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('admin.settings.app.name')}</label>
                            <input type="text" defaultValue="ClinicFlow" className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('admin.settings.app.logo')}</label>
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <Logo variant="icon" className="w-8 h-8 text-emerald-500" />
                                    <span className="font-bold text-slate-900">ClinicFlow</span>
                                </div>
                                <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                    {t('admin.settings.app.change')}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('admin.settings.app.lang')}</label>
                            <select disabled className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm opacity-75 cursor-not-allowed">
                                <option>{t('admin.settings.app.lang.desc')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Subscription Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">{t('admin.settings.subs')}</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('admin.settings.subs.trial')}</label>
                            <input type="number" defaultValue="14" className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('admin.settings.subs.plan')}</label>
                            <select className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option>Basic Plan</option>
                                <option>Standard Plan</option>
                                <option>Pro Plan</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                    {t('admin.settings.btn.save')}
                </Button>
                <Button variant="ghost" className="text-slate-500 hover:text-slate-700">
                    {t('admin.settings.btn.cancel')}
                </Button>
            </div>
        </div>
    );
}
