"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, MapPin, ChevronDown, ChevronUp, CheckCircle2,
    MessageSquare, Video, Calendar, Loader2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { clsx } from "clsx";
import { submitContactForm, submitDemoRequest } from "@/app/actions/contact";
import { toast } from "sonner";

export const ContactDetailed = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'demo' | 'message'>('demo');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                type: formData.get('type'),
                message: formData.get('message'),
            };

            const res = await submitContactForm(data);

            if (res.success) {
                toast.success(t('messages.success') || "Message envoyé avec succès !");
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error("Erreur lors de l'envoi du message.");
            }
        } catch (error) {
            toast.error("Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                clinicName: formData.get('clinicName'),
                city: formData.get('city'),
                slot: formData.get('slot'),
            };

            const res = await submitDemoRequest(data);

            if (res.success) {
                toast.success("Demande de démo envoyée !");
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error("Erreur lors de l'envoi de la demande.");
            }
        } catch (error) {
            toast.error("Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-slate-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 space-y-20 max-w-6xl">

                {/* Header & Tabs */}
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t('contact.title')}</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
                    </motion.div>

                    <div className="flex justify-center">
                        <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex relative">
                            <TabButton
                                active={activeTab === 'demo'}
                                onClick={() => setActiveTab('demo')}
                                label={t('contact.tab.demo')}
                            />
                            <TabButton
                                active={activeTab === 'message'}
                                onClick={() => setActiveTab('message')}
                                label={t('contact.tab.msg')}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Main Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-slate-100"
                    >
                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.form.name')}</label>
                                <input name="name" required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.form.email')}</label>
                                <input name="email" required type="email" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.form.phone')}</label>
                                <input name="phone" type="tel" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.form.type')}</label>
                                <div className="relative">
                                    <select name="type" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer text-slate-700">
                                        <option value="Support">{t('contact.form.type.support')}</option>
                                        <option value="Sales">{t('contact.form.type.sales')}</option>
                                        <option value="Other">{t('contact.form.type.other')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.form.msg')}</label>
                                <textarea name="message" required rows={4} className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input required type="checkbox" id="privacy" className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <label htmlFor="privacy" className="text-sm text-slate-500 font-medium cursor-pointer select-none">
                                    {t('contact.form.privacy')}
                                </label>
                            </div>

                            <Button disabled={isSubmitting} className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 rounded-xl transition-all hover:scale-[1.02]">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : t('contact.form.send')}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Right Column: Info & Quick Demo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Info Cards */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                            <InfoItem
                                icon={<Mail className="text-emerald-600" />}
                                title={t('contact.info.support')}
                                content="support@clinicflow.ma"
                                sub={t('contact.info.reply')}
                            />
                            <div className="h-px bg-slate-100" />
                            <InfoItem
                                icon={<Phone className="text-emerald-600" />}
                                title={t('contact.info.whatsapp')}
                                content="+212 764 42 67 18"
                                sub={t('contact.info.avail')}
                            />
                            <div className="h-px bg-slate-100" />
                            <InfoItem
                                icon={<MapPin className="text-emerald-600" />}
                                title={t('contact.info.address')}
                                content="Casablanca / Rabat"
                                sub=""
                            />
                        </div>

                        {/* Quick Demo Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{t('contact.demo.title')}</h3>
                                <p className="text-sm text-slate-500">{t('contact.demo.desc')}</p>
                            </div>
                            <form onSubmit={handleDemoSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="clinicName" required placeholder={t('contact.demo.clinic')} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                    <input name="city" required placeholder={t('contact.demo.city')} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                </div>
                                <div className="relative">
                                    <select name="slot" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer text-slate-600 font-medium">
                                        <option>{t('contact.demo.slot')}</option>
                                        <option>09:00 - 10:00</option>
                                        <option>14:00 - 15:00</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <Button disabled={isSubmitting} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md shadow-blue-200">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('contact.demo.book')}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 max-w-4xl mx-auto">
                    <div className="space-y-1">
                        <FAQItem q={t('faq.q1')} a={t('faq.a1')} />
                        <FAQItem q={t('faq.q2')} a={t('faq.a2')} />
                        <FAQItem q={t('faq.q3')} a={t('faq.a3')} />
                        <FAQItem q={t('admin.feature.qrcode.desc')} a={t('admin.feature.qrcode.desc')} />
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-emerald-100 to-teal-50 rounded-3xl p-12 text-center border border-emerald-100 shadow-sm"
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-8 max-w-2xl mx-auto">
                        {t('contact.cta.title')}
                    </h3>
                    <Link href="/register">
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-emerald-200 transition-all transform hover:scale-105">
                            {t('contact.cta.btn')}
                        </button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

function TabButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 z-10",
                active ? "text-white" : "text-slate-500 hover:text-slate-700"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10 shadow-md shadow-emerald-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            {label}
        </button>
    )
}

function InfoItem({ icon, title, content, sub }: any) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{title}</p>
                <p className="font-bold text-slate-800">{content}</p>
                {sub && <p className="text-xs text-slate-500 font-medium mt-1">{sub}</p>}
            </div>
        </div>
    )
}

function FAQItem({ q, a }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 py-4 hover:text-emerald-600 transition-colors"
            >
                {q}
                {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-slate-500 leading-relaxed text-sm">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
