"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Check, Star, Lock } from "lucide-react";
import { clsx } from "clsx";

export const Pricing = () => {
    // const { t } = useLanguage(); // Unused now

    return (
        <section id="pricing" className="py-24 relative">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Des tarifs simples.</h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* TURN Plan (Highlighted) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(45, 212, 191, 0.25)" }}
                        className="bg-white rounded-[2rem] p-8 border border-teal-100/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden ring-1 ring-teal-50"
                    >
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-deep to-primary" />
                        <div className="mb-6">
                            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md mb-2">TURN</span>
                            <h3 className="text-2xl font-bold text-ink">Gratuit (Bêta)</h3>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "File d'attente illimitée",
                                "Tableau de bord médecin",
                                "Vue patient temps réel",
                                "Configuration simple"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-ink">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button className="w-full">Commencer gratuitement</Button>
                    </motion.div>

                    {/* PRO Plan (Faded/Coming Soon) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm relative opacity-80"
                    >
                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                            Bientôt
                        </div>

                        <div className="mb-6">
                            <span className="inline-block bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded-md mb-2">PRO</span>
                            <h3 className="text-2xl font-bold text-slate-500">Premium</h3>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Statistiques avancées",
                                "Multi-praticiens",
                                "SMS de rappel",
                                "Personnalisation complète"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                        <Lock size={12} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button variant="secondary" disabled className="w-full">Bientôt disponible</Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
