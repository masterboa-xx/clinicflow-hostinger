"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export const FinalCTA = () => {
    const { t } = useLanguage();

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100/50" />
            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-ink mb-8"
                >
                    {t("cta.title")}
                </motion.h2>

                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Link href="/register">
                        <Button size="lg" className="px-12 py-4 text-xl shadow-2xl shadow-primary/30">
                            {t("cta.button")}
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
