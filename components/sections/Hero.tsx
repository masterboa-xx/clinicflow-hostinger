"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { QrCode, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

export const Hero = () => {
    const { t, dir } = useLanguage();

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Background Gradients - Large Soft Blobs (Refined) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-cyan-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-200/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-teal-100/40 rounded-full blur-[80px]" />
            </div>

            {/* Abstract Flow Shapes (Animated) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <motion.svg
                    viewBox="0 0 1440 900"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-60"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M-200 800 C 100 800, 400 400, 800 500 S 1400 100, 1800 200"
                        stroke="url(#gradient1)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, ease: "easeOut" }}
                    />
                    <motion.path
                        d="M-200 850 C 150 850, 450 450, 850 550 S 1450 150, 1850 250"
                        stroke="url(#gradient1)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.5 }}
                        transition={{ duration: 5, delay: 0.5, ease: "easeOut" }}
                    />
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0" />
                            <stop offset="50%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="var(--color-primary-deep)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            </div>

            <div className="container mx-auto px-4 z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[600px]">
                {/* Content - 7 cols on large screens to push towards center */}
                <div className={clsx("lg:col-span-7 flex flex-col justify-center", dir === 'rtl' ? "lg:items-end" : "lg:items-start")}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className={clsx("max-w-2xl", dir === 'rtl' ? "text-right" : "text-left")}
                    >
                        <motion.h1
                            className="text-5xl lg:text-7xl font-bold leading-tight text-ink mb-6"
                        >
                            {t("hero.headline")}
                        </motion.h1>
                        <motion.p
                            className="text-xl lg:text-2xl text-ink-light mb-10 leading-relaxed max-w-lg"
                        >
                            {t("hero.subtitle")}
                        </motion.p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    {t("hero.cta")}
                                    <ArrowRight className={clsx("w-5 h-5", dir === 'rtl' ? "mr-2 rotate-180" : "ml-2")} />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-white/50 border-slate-200 text-slate-700 hover:bg-white hover:text-primary">
                                    {t("hero.login")}
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <Link href="/p/demo-clinic" className="border-b border-dashed border-slate-400 hover:text-primary hover:border-primary transition-all">
                                Essayer la démo patient maintenant (Scan QR)
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Visual - 5 cols */}
                <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
                    {/* Enhanced Visual Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full max-w-md aspect-square"
                    >
                        {/* Animated background blobs specific to this visual */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-200/20 rounded-full blur-[60px] animate-pulse-slow" />

                        {/* Glass Card */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 w-full h-full bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center p-8 lg:p-12 overflow-hidden ring-1 ring-white/40"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>

                            {/* Inner White Container */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl w-full h-full flex flex-col items-center justify-center relative">
                                <QrCode size={180} className="text-slate-800" strokeWidth={1} />
                                <div className="mt-4 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Scan Me</p>
                                    <p className="text-sm font-semibold text-primary">ClinicFlow Patient</p>
                                </div>

                                {/* Scanning Beam */}
                                <motion.div
                                    animate={{ top: ["0%", "120%"] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_20px_rgba(45,212,191,0.8)] z-20"
                                />
                            </div>
                        </motion.div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                            transition={{ duration: 7, repeat: Infinity }}
                            className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100/50 backdrop-blur"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                            <div>
                                <div className="text-xs text-slate-400">Status</div>
                                <div className="text-sm font-bold text-slate-700">Votre tour!</div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
                            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                            className="absolute -left-4 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100/50 backdrop-blur"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">03</div>
                            <div>
                                <div className="text-xs text-slate-400">Patients</div>
                                <div className="text-sm font-bold text-slate-700">En attente</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
