"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { QrCode, Ticket, BellRing } from "lucide-react";
import { clsx } from "clsx";

export const HowItWorks = () => {
    const { t, dir } = useLanguage();

    const steps = [
        {
            id: 1,
            icon: <QrCode size={32} />,
            title: t("howItWorks.step1.title"),
            desc: t("howItWorks.step1.desc"),
        },
        {
            id: 2,
            icon: <Ticket size={32} />,
            title: t("howItWorks.step2.title"),
            desc: t("howItWorks.step2.desc"),
        },
        {
            id: 3,
            icon: <BellRing size={32} />,
            title: t("howItWorks.step3.title"),
            desc: t("howItWorks.step3.desc"),
        },
    ];

    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Comment ça marche ?</h2>
                    <p className="text-slate-500 text-lg">Une gestion simple des patients en 3 étapes.</p>
                </motion.div>

                <div className="relative grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {/* Connecting Wave Line */}
                    <div className="hidden md:block absolute top-[40%] left-0 right-0 h-24 z-0 pointer-events-none transform -translate-y-1/2">
                        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                            <path
                                d="M0,50 C250,90 250,10 500,50 C750,90 750,10 1000,50"
                                fill="none"
                                stroke="#2DD4BF"
                                strokeWidth="3"
                                strokeOpacity="0.4"
                                strokeDasharray="10 5"
                            />
                            {/* Directional Arrows on line */}
                            <circle cx="350" cy="50" r="16" fill="#CCFBF1" />
                            <path d="M346,44 L352,50 L346,56" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                            <circle cx="650" cy="50" r="16" fill="#CCFBF1" />
                            <path d="M646,44 L652,50 L646,56" stroke="#0F766E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <div className="bg-gradient-to-b from-teal-50 to-white rounded-[2rem] p-8 text-center shadow-lg shadow-teal-100/50 border border-teal-100 h-full flex flex-col items-center">
                            {/* Icon Container */}
                            <div className="-mt-16 mb-6 relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 p-1 shadow-lg shadow-teal-200/50 flex items-center justify-center ring-4 ring-white">
                                    <div className="w-full h-full bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                                        <QrCode size={40} className="text-teal-600" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Scannez le QR code</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Les patients scannent le QR code et prennent un ticket ou un rendez-vous instantanément.
                            </p>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10"
                    >
                        <div className="bg-gradient-to-b from-teal-50 to-white rounded-[2rem] p-8 text-center shadow-lg shadow-teal-100/50 border border-teal-100 h-full flex flex-col items-center">
                            {/* Icon Container */}
                            <div className="-mt-16 mb-6 relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 p-1 shadow-lg shadow-teal-200/50 flex items-center justify-center ring-4 ring-white">
                                    <div className="w-full h-full bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                                        <Ticket size={40} className="text-teal-600" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Gérez la file d'attente</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Visualisez les patients en temps réel et organisez votre flux depuis le tableau de bord.
                            </p>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="relative z-10"
                    >
                        <div className="bg-gradient-to-b from-teal-50 to-white rounded-[2rem] p-8 text-center shadow-lg shadow-teal-100/50 border border-teal-100 h-full flex flex-col items-center">
                            {/* Icon Container */}
                            <div className="-mt-16 mb-6 relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 p-1 shadow-lg shadow-teal-200/50 flex items-center justify-center ring-4 ring-white">
                                    <div className="w-full h-full bg-white/90 backdrop-blur rounded-full flex items-center justify-center relative">
                                        <BellRing size={40} className="text-teal-600" strokeWidth={1.5} />
                                        <div className="absolute top-4 right-5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Appelez le patient</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Le patient est notifié au bon moment et se présente sans attente inutile.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="text-center">
                    <Link href="/register">
                        <button className="bg-gradient-to-r from-teal-400 to-emerald-400 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all transform hover:scale-105">
                            Commencer gratuitement
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
