"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageContext";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export const Header = () => {
    const { t, dir } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: t("nav.home"), href: "/" },
        { label: t("nav.howItWorks"), href: "/how-it-works" },
        { label: t("nav.pricing"), href: "/pricing" },
        { label: t("nav.contact"), href: "/contact" },
    ];

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={clsx(
                "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-white/70 backdrop-blur-xl border-slate-200/50 py-3 shadow-sm"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Logo />

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-ink-light hover:text-primary font-medium transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSwitcher />
                    <Link href="/register">
                        <Button size="sm">{t("nav.demo")}</Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <LanguageSwitcher />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-ink p-1"
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label + 'mobile'}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-ink hover:text-primary py-2 border-b border-slate-100 last:border-0"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4">
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full justify-center">{t("nav.demo")}</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
