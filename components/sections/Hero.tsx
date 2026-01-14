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

            <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className={clsx("max-w-xl", dir === 'rtl' ? "lg:text-right" : "lg:text-left", "text-center")}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-6xl font-bold leading-tight text-ink mb-6"
                    >
                        {t("hero.headline")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl text-ink-light mb-8 leading-relaxed"
                    >
                        {t("hero.subheadline")} {/* Typo in key name in context vs usage? Context has hero.subtitle */}
                        {/* Wait, context has 'hero.subtitle', but usage was 'hero.subheadline'. Fix to 'hero.subtitle' */}
                        {t("hero.subtitle")}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className={clsx("flex flex-wrap gap-4 items-center", dir === 'rtl' ? "justify-center lg:justify-start" : "justify-center lg:justify-start")}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Link href="/login">
                                <Button size="lg" className="group">
                                    {t("hero.cta")}
                                    <ArrowRight className={clsx("w-5 h-5 transition-transform group-hover:translate-x-1", dir === 'rtl' ? "ml-0 mr-2 rotate-180 group-hover:-translate-x-1" : "ml-2")} />
                                </Button>
                            </Link>
                        </motion.div>
                        <Link href="/p/demo-clinic">
                            <Button variant="ghost" size="lg">
                                {t("hero.login")} {/* Was secondaryCta? Context has hero.login or hero.cta. */}
                                {/* In previous code it was t.hero.secondaryCta. My context update added hero.login. */}
                                {/* Let's use hero.login as secondary button */}
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Demo Prompt */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className={clsx("mt-6 flex items-center gap-2 text-sm text-slate-400", dir === 'rtl' ? "justify-center lg:justify-start" : "justify-center lg:justify-start")}
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        <Link href="/p/demo-clinic" className="hover:text-primary transition-colors border-b border-dashed border-slate-300 hover:border-primary pb-0.5">
                            Essayer la démo patient (Scan QR)
                        </Link>
                    </motion.div>
                </div>

                {/* Visual / QR Animation */}
                <div className="relative flex justify-center lg:justify-end">
                    {/* Floating Elements Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-80 h-80 md:w-96 md:h-96"
                    >
                        {/* Abstract Orbs */}
                        <motion.div
                            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
                        />
                        <motion.div
                            animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 left-0 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"
                        />

                        {/* Central QR Card */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 ring-1 ring-slate-100">
                                <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                                    {/* QR Pattern Simulation */}
                                    <QrCode size={120} className="text-ink opacity-80" strokeWidth={1.5} />
                                    {/* Scanning Effect */}
                                    <motion.div
                                        animate={{ top: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_20px_rgba(14,190,170,0.6)]"
                                    />
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg animate-bounce-slow">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
