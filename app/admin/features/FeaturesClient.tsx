"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageContext";

export function FeaturesClient() {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">{t('admin.features.title')}</h1>
                <p className="text-slate-500 text-lg">{t('admin.features.subtitle')}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">{t('admin.features.table.name')}</th>
                            <th className="px-6 py-4">{t('admin.features.table.desc')}</th>
                            <th className="px-6 py-4">{t('admin.features.table.status')}</th>
                            <th className="px-6 py-4">{t('admin.features.table.plans')}</th>
                            <th className="px-6 py-4">{t('admin.features.table.override')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <FeatureRow
                            name={t('admin.feature.qrcode')}
                            desc={t('admin.feature.qrcode.desc')}
                            active={true}
                            plans={["Pro", "Standard"]}
                        />
                        <FeatureRow
                            name={t('admin.feature.appointments')}
                            desc={t('admin.feature.appointments.desc')}
                            active={true}
                            plans={["Pro", "Standard", "Basic"]}
                        />
                        <FeatureRow
                            name={t('admin.feature.sms')}
                            desc={t('admin.feature.sms.desc')}
                            active={true}
                            plans={["Pro"]}
                        />
                        <FeatureRow
                            name={t('admin.feature.multi')}
                            desc={t('admin.feature.multi.desc')}
                            active={true}
                            plans={["Pro", "Standard"]}
                        />
                        <FeatureRow
                            name={t('admin.feature.analytics')}
                            desc={t('admin.feature.analytics.desc')}
                            active={false}
                            plans={["Pro"]}
                        />
                        <FeatureRow
                            name={t('admin.feature.branding')}
                            desc={t('admin.feature.branding.desc')}
                            active={false}
                            plans={["Pro"]}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FeatureRow({ name, desc, active, plans }: any) {
    const { t } = useLanguage();
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-5 font-bold text-slate-900 text-lg">{name}</td>
            <td className="px-6 py-5 text-slate-600">{desc}</td>
            <td className="px-6 py-5">
                <SmartSwitch checked={active} />
            </td>
            <td className="px-6 py-5">
                <div className="flex gap-2 justify-end">
                    {plans.includes("Basic") && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Basic</Badge>}
                    {plans.includes("Standard") && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Standard</Badge>}
                    {plans.includes("Pro") && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Pro</Badge>}
                </div>
            </td>
            <td className="px-6 py-5">
                <Button variant="secondary" size="sm" className="bg-slate-700 text-white hover:bg-slate-800 w-full">
                    {t('admin.features.btn.manage')}
                </Button>
            </td>
        </tr>
    )
}

function SmartSwitch({ checked }: { checked: boolean }) {
    return (
        <div dir="ltr" className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${checked ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </div>
    )
}
