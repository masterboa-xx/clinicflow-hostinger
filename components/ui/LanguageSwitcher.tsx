"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Language } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { clsx } from "clsx";

const flags: Record<Language, string> = {
    fr: "🇫🇷",
    en: "🇺🇸",
    ar: "🇲🇦",
};

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={toggleOpen}
                className="text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer p-1 rounded-full hover:bg-surface-hover/50"
                aria-label="Change Language"
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={language}
                        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                        transition={{ duration: 0.2 }}
                        className="block"
                    >
                        {flags[language]}
                    </motion.span>
                </AnimatePresence>
            </button>

            {/* Dropdown Options */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-2 flex flex-col gap-2 min-w-[3rem] items-center"
                    >
                        {(Object.keys(flags) as Language[]).map((lang) => {
                            if (lang === language) return null;
                            return (
                                <button
                                    key={lang}
                                    onClick={() => handleSelect(lang)}
                                    className="text-2xl hover:scale-110 transition-transform p-1 rounded-full hover:bg-primary/10"
                                >
                                    {flags[lang]}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
