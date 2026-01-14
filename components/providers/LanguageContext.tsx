"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "en" | "ar";

type Dictionary = {
    [key: string]: string;
};

const translations: Record<Language, Dictionary> = {
    fr: {
        "queue.title": "File d'attente",
        "queue.empty": "Aucun patient en attente",
        "current.title": "Patient actuel",
        "current.none": "Aucun patient actif",
        "current.start": "Démarrer la file",
        "current.helper": "Le premier patient sera appelé",
        "action.next": "Suivant",
        "action.finish": "Terminer",
        "action.cancel": "Annuler",
        "action.urgent": "Urgent",
        "action.delay": "Retarder",
        "header.status.active": "File active",
        "header.status.stopped": "File arrêtée",
        "settings.title": "Paramètres",
        "settings.questions": "Questions pour les patients",
        "logout": "Se déconnecter",
        "nav.features": "Fonctionnalités",
        "nav.howItWorks": "Comment ça marche",
        "nav.pricing": "Tarifs",
        "nav.contact": "Contact",
        "nav.demo": "Démo Médecin",
        "hero.title": "Gérez votre file d'attente.",
        "hero.subtitle": "Simplement.",
        "hero.description": "Optimisez le flux des patients, réduisez l'attente et libérez votre personnel avec ClinicFlow.",
        "hero.cta": "Commencer maintenant",
        "hero.login": "Connexion Médecin",
    },
    en: {
        "queue.title": "Waiting Queue",
        "queue.empty": "No patients waiting",
        "current.title": "Current Patient",
        "current.none": "No active patient",
        "current.start": "Start Queue",
        "current.helper": "The first patient will be called",
        "action.next": "Call Next",
        "action.finish": "Finish",
        "action.cancel": "Cancel",
        "action.urgent": "Urgent",
        "action.delay": "Delay",
        "header.status.active": "Queue Active",
        "header.status.stopped": "Queue Stopped",
        "settings.title": "Settings",
        "settings.questions": "Patient Questions",
        "logout": "Logout",
        "nav.features": "Features",
        "nav.howItWorks": "How it works",
        "nav.pricing": "Pricing",
        "nav.contact": "Contact",
        "nav.demo": "Doctor Demo",
        "hero.title": "Manage your queue.",
        "hero.subtitle": "Simply.",
        "hero.description": "Optimize patient flow, reduce waiting times, and free up your staff with ClinicFlow.",
        "hero.cta": "Start Now",
        "hero.login": "Doctor Login",
    },
    ar: {
        "queue.title": "قائمة الانتظار",
        "queue.empty": "لا يوجد مرضى في الانتظار",
        "current.title": "المريض الحالي",
        "current.none": "لا يوجد مريض حالياً",
        "current.start": "بدء القائمة",
        "current.helper": "سيتم استدعاء أول مريض",
        "action.next": "التالي",
        "action.finish": "إنهاء",
        "action.cancel": "إلغاء",
        "action.urgent": "عاجل",
        "action.delay": "تأجيل",
        "header.status.active": "القائمة نشطة",
        "header.status.stopped": "القائمة متوقفة",
        "settings.title": "الإعدادات",
        "settings.questions": "أسئلة المرضى",
        "logout": "تسجيل خروج",
        "nav.features": "المميزات",
        "nav.howItWorks": "كيف يعمل",
        "nav.pricing": "الأسعار",
        "nav.contact": "اتصل بنا",
        "nav.demo": "تجريبي للطبيب",
        "hero.title": "أدر قائمة الانتظار.",
        "hero.subtitle": "ببساطة.",
        "hero.description": "حسن تدفق المرضى، قلل وقت الانتظار وأرح موظفيك مع ClinicFlow.",
        "hero.cta": "ابدأ الآن",
        "hero.login": "دخول الطبيب",
    },
};

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("fr");

    useEffect(() => {
        // Simple persistence
        const saved = localStorage.getItem("clinicflow_lang") as Language;
        if (saved && ["fr", "en", "ar"].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("clinicflow_lang", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir: language === "ar" ? "rtl" : "ltr" }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
