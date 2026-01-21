"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { motion } from "framer-motion";
import {
    UserPlus, Ticket, Megaphone, Clock, Check,
    Stethoscope, Building2, FlaskConical, User,
    ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const HowItWorksDetailed = () => {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden font-sans min-h-screen">
            <div className="container mx-auto px-4 relative z-10 space-y-24">

                {/* Header Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                            {t('how.title')}
                        </h2>
                        <p className="text-xl text-slate-500 max-w-lg">
                            {t('how.subtitle')}
                        </p>
                        <Link href="/register">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-emerald-200 transaction-all hover:scale-105">
                                {t('how.btn.free')}
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Abstract Representation of the illustration from the image */}
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50" />
                            <div className="flex items-center gap-4 justify-center py-8">
                                <div className="text-emerald-600">
                                    <Stethoscope size={64} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-400">
                                                <User size={16} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">
                                        Queue Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Steps Grid */}
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Steps</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StepCard
                            number={1}
                            icon={<UserPlus size={28} className="text-emerald-600" />}
                            title={t('how.step1.title')}
                            desc={t('how.step1.desc')}
                        />
                        <StepCard
                            number={2}
                            icon={<Ticket size={28} className="text-emerald-600" />}
                            title={t('how.step2.title')}
                            desc={t('how.step2.desc')}
                        />
                        <StepCard
                            number={3}
                            icon={<Megaphone size={28} className="text-emerald-600" />}
                            title={t('how.step3.title')}
                            desc={t('how.step3.desc')}
                        />
                        <StepCard
                            number={4}
                            icon={<Clock size={28} className="text-emerald-600" />}
                            title={t('how.step4.title')}
                            desc={t('how.step4.desc')}
                        />
                    </div>
                </div>

                {/* Why & Target Section */}
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Why */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('how.why.title')}</h3>
                        <ul className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-emerald-600" />
                                    </div>
                                    {t(`how.why.${i}`)}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Target */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('how.target.title')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <TargetCard icon={<Building2 size={20} />} label={t('how.target.1')} />
                            <TargetCard icon={<Stethoscope size={20} />} label={t('how.target.2')} />
                            <TargetCard icon={<User size={20} />} label={t('how.target.3')} />
                            <TargetCard icon={<Building2 size={20} />} label={t('how.target.4')} />
                            <TargetCard icon={<FlaskConical size={20} />} label={t('how.target.5')} />
                        </div>
                    </motion.div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">{t('how.faq.title')}</h3>
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-4">
                            <FAQItem q={t('faq.q1')} a={t('faq.a1')} />
                            <FAQItem q={t('faq.q2')} a={t('faq.a2')} />
                        </div>
                        <div className="space-y-4">
                            <FAQItem q={t('faq.q3')} a={t('faq.a3')} />
                            <FAQItem q={t('faq.q4')} a={t('faq.a4')} />
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-12 text-center border border-emerald-100 shadow-sm"
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t('how.cta.title')}
                    </h3>
                    <Link href="/register">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-14 px-10 rounded-xl text-lg shadow-lg shadow-emerald-200 transition-all hover:scale-105">
                            {t('how.cta.btn')}
                        </Button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

function StepCard({ number, icon, title, desc }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full"
        >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-3 leading-tight">{title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </motion.div>
    )
}

function TargetCard({ icon, label }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-default">
            <div className="text-slate-400">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-600">{label}</span>
        </div>
    )
}

function FAQItem({ q, a }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-100 pb-4 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-800 text-sm hover:text-emerald-600 transition-colors"
            >
                {q}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && (
                <p className="mt-2 text-sm text-slate-500 leading-relaxed animate-in slide-in-from-top-1">
                    {a}
                </p>
            )}
        </div>
    )
}
