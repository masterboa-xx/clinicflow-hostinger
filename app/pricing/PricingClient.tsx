"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Check, Lock, ChevronDown, CreditCard, Headphones, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { clsx } from "clsx";
import Link from "next/link";

export function PricingClient() {
    const { t, language } = useLanguage();
    const [isYearly, setIsYearly] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);



    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] font-sans selection:bg-emerald-100">
            <Header />

            {/* Decorative Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />
            </div>

            <main className="flex-grow pt-32 pb-20 px-4 md:px-8 relative z-10 transition-opacity duration-700 ease-out" style={{ opacity: mounted ? 1 : 0 }}>
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center md:text-left md:flex md:items-end justify-between mb-8 pb-4 border-b border-slate-200/60">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold mb-3 uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                {t('pricing.v3.subtitle.badge')}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{t('pricing.v3.title')}</h1>
                            <p className="text-slate-500 mt-2 text-lg">{t('pricing.v3.subtitle')}</p>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">

                        {/* Comparison Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {t('pricing.v3.compare')}
                            </h2>

                            {/* Toggle */}
                            <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-full pr-6 relative group cursor-pointer" onClick={() => setIsYearly(!isYearly)}>
                                <div className={clsx(
                                    "absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out",
                                    isYearly ? (language === 'ar' ? 'right-1.5' : 'left-[calc(50%+3px)]') : (language === 'ar' ? 'left-[calc(50%+3px)]' : 'left-1.5')
                                )} />

                                <button className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {t('pricing.v3.monthly')}
                                </button>
                                <button className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {t('pricing.v3.yearly')}
                                </button>

                                {isYearly && (
                                    <span className="absolute -top-6 right-0 text-emerald-600 text-[12px] font-medium animate-in slide-in-from-bottom-2 fade-in duration-300">
                                        {t('pricing.v3.save2months')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                            {/* Trial Card */}
                            <div className={clsx(
                                "group border border-slate-100 bg-white rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-emerald-200/50 hover:-translate-y-1",
                                mounted ? "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100" : "opacity-0"
                            )}>
                                <div className="mb-6">
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">{t('pricing.v3.trial.title')}</h3>
                                    <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('pricing.v3.trial.price')}</div>
                                </div>

                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Features</div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <V3Feature text={t('pricing.feat.queue')} />
                                    <V3Feature text={t('pricing.feat.qr')} />
                                    <V3Feature text={t('pricing.feat.dashboard')} />
                                </ul>



                                <Link href="/register?plan=trial" className="block w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 shadow-sm h-11 font-semibold group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all"
                                    >
                                        {t('pricing.v3.trial.btn')}
                                    </Button>
                                </Link>
                            </div>

                            {/* Pro Card (Recommended) */}
                            <div className={clsx(
                                "relative border-2 border-emerald-500 bg-white rounded-2xl p-6 flex flex-col shadow-xl shadow-emerald-500/10 md:-mt-4 md:mb-4 ring-4 ring-emerald-50 transform transition-all duration-300 hover:ring-emerald-100 hover:scale-[1.02]",
                                mounted ? "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200" : "opacity-0"
                            )}>
                                {/* Pulse Effect on Load */}
                                <div className="absolute inset-0 rounded-2xl ring-4 ring-emerald-400/20 animate-ping duration-[2s] [animation-iteration-count:1] pointer-events-none" style={{ animationDelay: '1s' }} />

                                <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500 rounded-t-xl" />
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                                    {t('pricing.v3.pro.badge')}
                                </div>

                                <div className="mb-6 mt-2">
                                    <h3 className="font-bold text-emerald-900 text-xl mb-2">{t('pricing.v3.pro.title')}</h3>
                                    <div className="flex items-baseline gap-1 h-10 overflow-hidden">
                                        <div key={isYearly ? 'year' : 'month'} className="text-4xl font-extrabold text-slate-900 tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            {isYearly ? '1990' : '199'}
                                            <span className="text-2xl ml-1">DH</span>
                                        </div>
                                        <span className="text-slate-500 font-medium">/{isYearly ? t('pricing.v3.yearly') : t('pricing.v3.monthly').toLowerCase()}</span>
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-6 border-b border-emerald-100 pb-2">Features</div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <V3Feature text={t('pricing.feat.queue')} active />
                                    <V3Feature text={t('pricing.feat.qr')} active />
                                    <V3Feature text={t('pricing.feat.dashboard')} active />
                                    <V3Feature text={t('pricing.feat.sms')} active />
                                    <V3Feature text={t('pricing.feat.support24')} active />
                                </ul>

                                <Link href="/register?plan=pro" className="block w-full">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 h-12 text-base font-bold transition-all hover:shadow-emerald-300 active:scale-95"
                                    >
                                        {t('pricing.v3.pro.btn')}
                                    </Button>
                                </Link>
                            </div>

                            {/* Premium Card */}
                            <div className={clsx(
                                "group border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:opacity-100 opacity-75 grayscale hover:grayscale-0",
                                mounted ? "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300" : "opacity-0"
                            )}>
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-slate-500 text-lg">{t('pricing.v3.prem.title')}</h3>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase">Soon</span>
                                    </div>
                                    <div className="text-4xl font-extrabold text-slate-400 tracking-tight">—</div>
                                </div>

                                <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Features</div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <V3Feature text={t('pricing.feat.stats')} disabled />
                                    <V3Feature text={t('pricing.feat.multi')} disabled />
                                    <V3Feature text={t('pricing.feat.custom')} disabled />
                                </ul>

                                <div className="relative group/btn">
                                    <Button disabled className="w-full bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                                        {t('pricing.v3.prem.btn')}
                                    </Button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Disponible prochainement
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-16 pt-8 border-t border-slate-100">
                            <div
                                className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg transition-colors hover:bg-slate-50"
                                onClick={() => setIsFaqOpen(!isFaqOpen)}
                            >
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-slate-400" />
                                    {t('pricing.v3.faq.title')}
                                </h3>
                                <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform duration-300", isFaqOpen && "rotate-180")} />
                            </div>

                            <div className={clsx(
                                "grid md:grid-cols-2 gap-4 mt-4 transition-all duration-500 ease-in-out overflow-hidden",
                                isFaqOpen ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
                            )}>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors">
                                    <p className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {t('pricing.faq.free.q')}
                                    </p>
                                    <p className="text-slate-500 text-sm leading-relaxed pl-3.5 border-l border-slate-200 ml-0.5">{t('pricing.faq.free.a')}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors">
                                    <p className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {t('pricing.faq.change.q')}
                                    </p>
                                    <p className="text-slate-500 text-sm leading-relaxed pl-3.5 border-l border-slate-200 ml-0.5">{t('pricing.faq.change.a')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Badges */}
                        <div className="mt-10 flex flex-wrap items-center justify-end gap-x-8 gap-y-4 border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide opacity-75 hover:opacity-100 transition-opacity">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                {t('pricing.v3.secure')}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide opacity-75 hover:opacity-100 transition-opacity">
                                <Headphones className="w-4 h-4 text-emerald-500" />
                                {t('pricing.v3.support')}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

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
