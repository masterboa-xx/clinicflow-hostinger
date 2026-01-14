"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    const { language } = useLanguage();

    const content = {
        fr: {
            title: "Politique de Confidentialité",
            lastUpdated: "Dernière mise à jour : 12 Janvier 2026",
            intro: "Chez ClinicFlow, nous accordons une importance capitale à la confidentialité de vos données et de celles de vos patients. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.",
            sections: [
                {
                    heading: "1. Collecte des données",
                    text: "Nous collectons uniquement les données nécessaires au bon fonctionnement de la file d'attente : numéros de téléphone (pour les notifications) et pseudonymes/prénoms pour l'affichage."
                },
                {
                    heading: "2. Utilisation des données",
                    text: "Les données sont utilisées exclusivement pour : gérer la file d'attente en temps réel, envoyer des notifications SMS/WhatsApp de rappel, et générer des statistiques anonymes pour la clinique."
                },
                {
                    heading: "3. Sécurité",
                    text: "Vos données sont chiffrées en transit et au repos. Nous utilisons des protocoles de sécurité conformes aux standards de l'industrie médicale."
                },
                {
                    heading: "4. Partage des données",
                    text: "Nous ne vendons ni ne louons jamais vos données personnelles à des tiers. Le partage se fait uniquement avec nos prestataires techniques (hébergement, envoi de SMS) sous stricte confidentialité."
                }
            ]
        },
        en: {
            title: "Privacy Policy",
            lastUpdated: "Last Updated: January 12, 2026",
            intro: "At ClinicFlow, we prioritize the privacy of your data and that of your patients. This policy explains how we collect, use, and protect your information.",
            sections: [
                {
                    heading: "1. Data Collection",
                    text: "We collect only the data necessary for queue management: phone numbers (for notifications) and first names/pseudonyms for display."
                },
                {
                    heading: "2. Data Usage",
                    text: "Data is used exclusively to: manage the real-time queue, send SMS/WhatsApp reminders, and generate anonymous statistics for the clinic."
                },
                {
                    heading: "3. Security",
                    text: "Your data is encrypted in transit and at rest. We use security protocols compliant with medical industry standards."
                },
                {
                    heading: "4. Data Sharing",
                    text: "We never sell or rent your personal data to third parties. Sharing occurs only with our technical providers (hosting, SMS dispatch) under strict confidentiality."
                }
            ]
        },
        ar: {
            title: "سياسة الخصوصية",
            lastUpdated: "آخر تحديث: 12 يناير 2026",
            intro: "في ClinicFlow، نولي أهمية قصوى لخصوصية بياناتك وبيانات مرضاك. تشرح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.",
            sections: [
                {
                    heading: "1. جمع البيانات",
                    text: "نجمع فقط البيانات الضرورية لتشغيل قائمة الانتظار: أرقام الهواتف (للإشعارات) والأسماء الأولى/الألقاب للعرض."
                },
                {
                    heading: "2. استخدام البيانات",
                    text: "تُستخدم البيانات حصرياً لـ: إدارة الطابور في الوقت الفعلي، إرسال تذكيرات SMS/واتساب، وإنشاء إحصاءات مجهولة للعيادة."
                },
                {
                    heading: "3. الأمان",
                    text: "يتم تشفير بياناتك أثناء النقل والتخزين. نستخدم بروتوكولات أمان متوافقة مع معايير الصناعة الطبية."
                },
                {
                    heading: "4. مشاركة البيانات",
                    text: "لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة أبداً. تتم المشاركة فقط مع مقدمي الخدمات التقنية (الاستضافة، إرسال الرسائل) تحت سرية تامة."
                }
            ]
        }
    };

    const t = content[language];

    return (
        <main className="min-h-screen bg-background text-ink">
            <Header />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-deep">{t.title}</h1>
                    <p className="text-sm text-ink-light mb-12 bg-slate-50 inline-block px-4 py-2 rounded-full border border-slate-100">
                        {t.lastUpdated}
                    </p>

                    <div className="prose prose-lg prose-slate max-w-none text-ink-light">
                        <p className="text-xl leading-relaxed mb-12 font-light text-ink">
                            {t.intro}
                        </p>

                        <div className="space-y-12">
                            {t.sections.map((section, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                    <h2 className="text-2xl font-bold text-ink mb-4">{section.heading}</h2>
                                    <p className="leading-relaxed">{section.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
