"use client";

import { useLanguage, Language } from "@/components/providers/LanguageContext";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        if (language === 'en') setLanguage('fr');
        else if (language === 'fr') setLanguage('ar');
        else setLanguage('en');
    };

    // Using a simple toggle/cycle for now, or a small dropdown logic if needed?
    // User asked for "button mnin n9dar nbedel logha". Simple cycle or select.
    // Let's make it a select or cycle for simplicity in code, or a nice dropdown.
    // Let's use a nice select style.

    return (
        <div className="flex items-center gap-2">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer"
            >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
            </select>
        </div>
    );
}
