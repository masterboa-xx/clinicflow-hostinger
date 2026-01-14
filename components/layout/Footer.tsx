"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Logo } from "@/components/brand/Logo";
import Link from "next/link";
import { clsx } from "clsx";

export const Footer = () => {
    const { t, dir } = useLanguage();
    const curYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 py-12 border-t border-slate-100">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Brand & Copyright */}
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <Link href="/">
                        <Logo size="md" />
                    </Link>
                    <span className="hidden md:inline-block w-px h-6 bg-slate-200"></span>
                    <p className="text-sm text-slate-400 font-medium">
                        © {curYear} ClinicFlow. {t("footer.rights")}
                    </p>
                </div>

                {/* Legal Links */}
                <div className="flex items-center gap-6">
                    <Link href="/privacy" className="text-sm text-ink-light hover:text-primary transition-colors font-medium">
                        {t("footer.privacy")}
                    </Link>
                </div>
            </div>
        </footer>
    );
};
