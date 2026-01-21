"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Check, Lock, Sparkles, CreditCard, Headphones } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import Link from "next/link";

export const Pricing = () => {
    const { t, language } = useLanguage();
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="py-24 relative bg-slate-50/50">
            <div className="container mx-auto px-4 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold mb-4 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        {t('pricing.v3.subtitle.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        {t('pricing.v3.title')}
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        {t('pricing.v3.subtitle')}
                    </p>
                </motion.div>

                {/* Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4 bg-white p-1.5 rounded-full pr-6 relative group cursor-pointer border border-slate-200 shadow-sm" onClick={() => setIsYearly(!isYearly)}>
                        <div className={clsx(
                            "absolute inset-y-1.5 w-[calc(50%-6px)] bg-slate-900 rounded-full shadow-sm transition-all duration-300 ease-in-out",
                            isYearly ? (language === 'ar' ? 'right-1.5' : 'left-[calc(50%+3px)]') : (language === 'ar' ? 'left-[calc(50%+3px)]' : 'left-1.5')
                        )} />

                        <button className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${!isYearly ? 'text-white' : 'text-slate-500'}`}>
                            {t('pricing.v3.monthly')}
                        </button>
                        <button className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${isYearly ? 'text-white' : 'text-slate-500'}`}>
                            {t('pricing.v3.yearly')}
                        </button>

                        {isYearly && (
                            <span className="absolute -top-6 right-0 text-emerald-600 text-[12px] font-bold animate-in slide-in-from-bottom-2 fade-in duration-300 bg-emerald-50 px-2 py-0.5 rounded-full">
                                -17%
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">

                    {/* Trial Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
                    >
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 text-xl mb-2">{t('pricing.v3.trial.title')}</h3>
                            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('pricing.v3.trial.price')}</div>
                        </div>

                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Features</div>
                        <ul className="space-y-4 mb-8">
                            <V3Feature text={t('pricing.feat.queue')} />
                            <V3Feature text={t('pricing.feat.qr')} />
                            <V3Feature text={t('pricing.feat.dashboard')} />
                        </ul>

                        <Link href="/register?plan=trial" className="block w-full">
                            <Button variant="outline" className="w-full h-12 bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 font-bold group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all">
                                {t('pricing.v3.trial.btn')}
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Pro Card (Recommended) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl p-8 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            {t('pricing.v3.pro.badge')}
                        </div>

                        <div className="mb-6 mt-2">
                            <h3 className="font-bold text-emerald-900 text-2xl mb-2">{t('pricing.v3.pro.title')}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                                    {isYearly ? '1990' : '199'}
                                </span>
                                <span className="text-2xl font-bold text-slate-900">DH</span>
                                <span className="text-slate-500 font-medium">/{isYearly ? t('pricing.v3.yearly') : t('pricing.v3.monthly').toLowerCase()}</span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-2 font-bold uppercase tracking-wide">
                                {isYearly ? t('pricing.v3.save2months') : t('pricing.v3.subtitle.badge')}
                            </p>
                        </div>

                        <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-6 border-b border-emerald-100 pb-2">All Features</div>
                        <ul className="space-y-4 mb-8">
                            <V3Feature text={t('pricing.feat.queue')} active />
                            <V3Feature text={t('pricing.feat.qr')} active />
                            <V3Feature text={t('pricing.feat.dashboard')} active />
                            <V3Feature text={t('pricing.feat.sms')} active />
                            <V3Feature text={t('pricing.feat.support24')} active />
                        </ul>

                        <Link href="/register?plan=pro" className="block w-full">
                            <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 text-lg font-bold transition-all hover:shadow-emerald-300">
                                {t('pricing.v3.pro.btn')}
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Premium Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-50/50 rounded-2xl p-8 border border-slate-200 opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-500 text-xl">{t('pricing.v3.prem.title')}</h3>
                                <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase">Soon</span>
                            </div>
                            <div className="text-4xl font-extrabold text-slate-400 tracking-tight">—</div>
                        </div>

                        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Features</div>
                        <ul className="space-y-4 mb-8">
                            <V3Feature text={t('pricing.feat.stats')} disabled />
                            <V3Feature text={t('pricing.feat.multi')} disabled />
                            <V3Feature text={t('pricing.feat.custom')} disabled />
                        </ul>

                        <Button disabled className="w-full h-12 bg-slate-100 text-slate-400 border border-slate-200 font-bold cursor-not-allowed">
                            {t('pricing.v3.prem.btn')}
                        </Button>
                    </motion.div>
                </div>

                {/* Footer Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 flex justify-center gap-8"
                >
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                        <CreditCard className="w-4 h-4" />
                        {t('pricing.v3.secure')}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                        <Headphones className="w-4 h-4" />
                        {t('pricing.v3.support')}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

function V3Feature({ text, disabled, active }: { text: string, disabled?: boolean, active?: boolean }) {
    return (
        <li className="flex items-start gap-3 group/feat">
            <div className={clsx(
                "mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                active ? "bg-emerald-100 group-hover/feat:bg-emerald-200" : "bg-slate-100 group-hover/feat:bg-slate-200"
            )}>
                {disabled ? (
                    <Lock className="w-3 h-3 text-slate-300" />
                ) : (
                    <Check className={clsx("w-3 h-3 transition-colors", active ? "text-emerald-600" : "text-slate-500")} />
                )}
            </div>
            <span className={clsx(
                "text-sm font-medium transition-colors",
                disabled ? "text-slate-400" : active ? "text-slate-700 group-hover/feat:text-emerald-800" : "text-slate-600"
            )}>{text}</span>
        </li>
    );
}
