"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";

export function PlansClient() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('admin.plans.title')}</h1>
                </div>
                <Button>{t('admin.plans.btn.create')}</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PlanCard
                    name="Basic Plan"
                    monthly="490 DH"
                    yearly="4900 DH"
                    features={["Queue Management", "Patient Database", "Basic Reports"]}
                    limits={{ users: 5, clinics: 1, sms: "100/mo" }}
                    variant="blue"
                />
                <PlanCard
                    name="Standard Plan"
                    monthly="990 DH"
                    yearly="9900 DH"
                    features={["All Basic features", "Multi-Doctor Support", "Advanced Analytics", "Email Notifications"]}
                    limits={{ users: 20, clinics: 3, sms: "500/mo" }}
                    variant="indigo"
                />
                <PlanCard
                    name="Pro Plan"
                    monthly="1990 DH"
                    yearly="19900 DH"
                    features={["All Standard features", "Priority Support", "Custom Branding", "API Access"]}
                    limits={{ users: "Unlimited", clinics: "Unlimited", sms: "2000/mo" }}
                    variant="purple"
                />
            </div>
        </div>
    );
}

function PlanCard({ name, monthly, yearly, features, limits, variant }: any) {
    const { t } = useLanguage();
    const colors = {
        blue: "bg-blue-500",
        indigo: "bg-indigo-500",
        purple: "bg-purple-500"
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-4 ${(colors as any)[variant] || "bg-slate-900"} text-white flex justify-between items-center`}>
                <h3 className="font-bold text-lg">{name}</h3>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">Active</Badge>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">{t('admin.plans.monthly')}:</span>
                        <span className="text-lg font-bold text-slate-900">{monthly}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">{t('admin.plans.yearly')}:</span>
                        <span className="text-lg font-bold text-slate-900">{yearly}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">{t('admin.plans.features')}</h4>
                    <ul className="space-y-2">
                        {features.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100 mt-auto">
                    <h4 className="font-semibold text-slate-900">{t('admin.plans.limits')}</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-slate-500">{t('admin.plans.limit.users')}:</span>
                        <span className="font-medium text-slate-900 text-end">{limits.users}</span>
                        <span className="text-slate-500">{t('admin.plans.limit.clinics')}:</span>
                        <span className="font-medium text-slate-900 text-end">{limits.clinics}</span>
                        <span className="text-slate-500">{t('admin.plans.limit.sms')}:</span>
                        <span className="font-medium text-slate-900 text-end">{limits.sms}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full bg-slate-900 text-white hover:bg-slate-800">{t('admin.plans.btn.edit')}</Button>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">{t('admin.plans.btn.disable')}</Button>
            </div>
        </div>
    )
}
