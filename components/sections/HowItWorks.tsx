"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { motion } from "framer-motion";
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
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">{t("howItWorks.title")}</h2>
                </motion.div>

                <div className="relative grid md:grid-cols-3 gap-8">
                    {/* Animated Connecting Path (Desktop only - Refined Curve) */}
                    <div className={clsx("hidden md:block absolute top-[80px] left-[15%] right-[15%] h-20 z-0 pointer-events-none", dir === 'rtl' ? "scale-x-[-1]" : "")}>
                        <svg width="100%" height="100%" viewBox="0 0 600 100" preserveAspectRatio="none">
                            <motion.path
                                d="M0,50 C150,50 150,90 300,90 S 450,50 600,50"
                                fill="none"
                                stroke="url(#flowGradient)"
                                strokeWidth="3"
                                strokeDasharray="8 8"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 0.6 }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                            />
                            <defs>
                                <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#2DD4BF" />
                                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
                            className="relative z-10 flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-teal-100/50 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all opacity-50" />
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="relative w-24 h-24 bg-gradient-to-br from-white to-slate-50 rounded-[2rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] border border-white flex items-center justify-center text-teal-500 ring-4 ring-slate-50/50"
                                >
                                    {step.icon}
                                </motion.div>
                            </div>

                            <h3 className="text-xl font-bold text-ink mb-3">{step.title}</h3>
                            <p className="text-ink-light max-w-xs leading-relaxed font-light">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
